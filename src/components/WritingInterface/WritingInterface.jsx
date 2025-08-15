import React, { useState, useEffect } from 'react';
import Header from '../Header';
import WritingArea from '../WritingArea';
import FeedbackPanel from '../FeedbackPanel';
import DialecticalSidebar from '../DialecticalSidebar';
import { useWritingAnalysis } from '../../hooks/useWritingAnalysis';
import { createComplexFromWriting, applyComplexInsight } from '../../agents/inquiryIntegrationAgent';
import inquiryComplexService from '../../services/inquiryComplexService';

const WritingInterface = ({ purpose, content, onContentChange, feedback, setFeedback, onBackToPurpose, project, writingCriteria }) => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [hoveredFeedback, setHoveredFeedback] = useState(null);
  const [initialComplexes, setInitialComplexes] = useState([]);
  const [dialecticalSidebarOpen, setDialecticalSidebarOpen] = useState(false);
  const [dialecticalOpportunities, setDialecticalOpportunities] = useState([]);
  const [activeComplexes, setActiveComplexes] = useState([]);
  
  const { 
    feedback: hookFeedback, 
    clearFeedback, 
    dismissSuggestion, 
    markSuggestionResolved, 
    isEvaluating, 
    isAnalyzing,
    runDocumentAnalysis,
    isDocumentAnalyzing
  } = useWritingAnalysis(content, purpose, isMonitoring, writingCriteria);
  
  // Sync hook feedback with passed feedback when hook updates
  useEffect(() => {
    if (setFeedback && hookFeedback && hookFeedback.length > 0) {
      setFeedback(hookFeedback);
    }
  }, [hookFeedback?.length]); // Only trigger when feedback count changes, not the array reference
  
  // Always use hook feedback for display since it handles filtering correctly
  // Only use passed feedback for initial state synchronization
  const activeFeedback = hookFeedback || [];
  const activeFeedbackSetter = setFeedback || (() => {});

  // Load initial complexes when component mounts
  useEffect(() => {
    const complexes = inquiryComplexService.getAllComplexes();
    setInitialComplexes(complexes);
  }, []);

  // Update active complexes when complexes change
  useEffect(() => {
    const updateComplexes = () => {
      const complexes = inquiryComplexService.getAllComplexes();
      setActiveComplexes(complexes);
    };
    
    updateComplexes();
    // Set up interval to check for complex updates
    const interval = setInterval(updateComplexes, 2000);
    return () => clearInterval(interval);
  }, []);

  // Extract dialectical opportunities from feedback
  useEffect(() => {
    if (hookFeedback) {
      const opportunities = hookFeedback.filter(item => 
        item.type === 'dialectical_opportunity' || 
        item.type === 'complex_suggestion' ||
        (item.type === 'intellectual' && item.actionData?.type === 'dialectical_guide')
      );
      setDialecticalOpportunities(opportunities);
    }
  }, [hookFeedback]);

  const handleToggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const handleFeedbackHover = (feedbackId) => {
    setHoveredFeedback(feedbackId);
  };

  const handleFeedbackLeave = () => {
    setHoveredFeedback(null);
  };

  // Inquiry integration action handlers
  const handleCreateComplex = async (question, relevantText) => {
    try {
      const complex = await createComplexFromWriting(question, relevantText || content, purpose);
      console.log('Created complex:', complex);
      // Optionally navigate to inquiry mode to show the new complex
    } catch (error) {
      console.error('Failed to create complex:', error);
    }
  };

  const handleApplyInsight = async (suggestion, complexId, nodeId) => {
    try {
      const applicationSuggestions = await applyComplexInsight(content, suggestion, complexId, nodeId);
      console.log('Insight application suggestions:', applicationSuggestions);
      // Optionally show these suggestions to the user or auto-apply them
    } catch (error) {
      console.error('Failed to apply insight:', error);
    }
  };

  const handleExploreFramework = (framework, keyAuthorities, suggestedResources) => {
    console.log('Framework exploration:', { framework, keyAuthorities, suggestedResources });
    // Optionally show a modal with framework information or navigate to resources
  };

  const handleJumpToText = (feedbackId) => {
    // Find the feedback item
    const feedbackItem = activeFeedback.find(f => f.id === feedbackId);
    if (feedbackItem && feedbackItem.positions && feedbackItem.positions.length > 0) {
      const position = feedbackItem.positions[0];
      // Trigger scroll by setting hovered feedback temporarily
      setHoveredFeedback(feedbackId);
      // Clear after scroll animation completes
      setTimeout(() => setHoveredFeedback(null), 2000);
    }
  };

  // Dialectical sidebar handlers
  const handleToggleDialecticalSidebar = () => {
    setDialecticalSidebarOpen(!dialecticalSidebarOpen);
  };

  const handleCreateDialecticalComplex = async (actionData) => {
    try {
      const { claim, suggestedCounterArgs } = actionData;
      const question = `Is the following claim valid: "${claim}"?`;
      const complex = await createComplexFromWriting(question, content, purpose);
      
      // Add suggested counter-arguments as refutations
      if (suggestedCounterArgs && suggestedCounterArgs.length > 0) {
        for (const counterArg of suggestedCounterArgs) {
          await inquiryComplexService.addNode(complex.id, counterArg, 'refutation');
        }
      }
      
      console.log('Created dialectical complex:', complex);
      // Update complexes display
      const updatedComplexes = inquiryComplexService.getAllComplexes();
      setActiveComplexes(updatedComplexes);
      
    } catch (error) {
      console.error('Failed to create dialectical complex:', error);
    }
  };

  const handleExploreComplex = (complexId) => {
    // For now, just log - in the future this could navigate to the inquiry complex tab
    // or open a modal with complex exploration tools
    console.log('Exploring complex:', complexId);
  };

  const handleApplyInsightToWriting = async (insightData) => {
    try {
      const { insight, content: insightContent, complexId } = insightData;
      
      // Use the existing applyComplexInsight function
      const applicationSuggestions = await applyComplexInsight(content, insight, complexId);
      
      // For now, log the suggestions - in the future we could auto-apply or show in a modal
      console.log('Insight application suggestions:', applicationSuggestions);
      
      // Create a feedback item with the suggestions
      const feedbackItem = {
        id: `insight-application-${Date.now()}`,
        type: 'insight_application',
        agent: 'Dialectical Assistant',
        severity: 'medium',
        title: 'Apply Insight to Writing',
        feedback: `Insight from your complex: "${insight}"`,
        suggestion: applicationSuggestions?.textualSuggestions?.[0]?.newText || 'Consider incorporating this insight into your writing.',
        positions: [{ start: content.length - 50, end: content.length, text: content.slice(-50) }],
        timestamp: new Date(),
        status: 'active'
      };
      
      // Add to feedback
      if (setFeedback) {
        setFeedback(prev => [...prev, feedbackItem]);
      }
      
    } catch (error) {
      console.error('Failed to apply insight:', error);
    }
  };

  const handleAddressCounterArg = (actionData) => {
    // Create a feedback item with specific counter-argument guidance
    const feedbackItem = {
      id: `counter-arg-${Date.now()}`,
      type: 'counter_argument_guide',
      agent: 'Dialectical Critic',
      severity: 'medium',
      title: 'Address Counter-Argument',
      feedback: `Consider addressing this potential objection: "${actionData.counterArgument}"`,
      suggestion: actionData.suggestion || 'Add a paragraph acknowledging and responding to this concern.',
      positions: [{ start: content.length - 50, end: content.length, text: content.slice(-50) }],
      timestamp: new Date(),
      status: 'active'
    };
    
    if (setFeedback) {
      setFeedback(prev => [...prev, feedbackItem]);
    }
  };

  return (
    <>
      <Header 
        purpose={purpose}
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        onClearFeedback={clearFeedback}
        onBackToPurpose={onBackToPurpose}
        onDocumentAnalysis={runDocumentAnalysis}
        isDocumentAnalyzing={isDocumentAnalyzing}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Show initial complexes notification */}
        {initialComplexes.length > 0 && content.length < 100 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800 mb-1">
                  ✨ Generated {initialComplexes.length} Inquiry Complex{initialComplexes.length > 1 ? 'es' : ''} from Your Purpose
                </h3>
                <div className="text-sm text-green-700 space-y-1">
                  {initialComplexes.slice(0, 3).map((complex, index) => (
                    <div key={complex.id}>
                      • "{complex.centralQuestion}"
                    </div>
                  ))}
                  {initialComplexes.length > 3 && (
                    <div className="text-green-600">...and {initialComplexes.length - 3} more</div>
                  )}
                </div>
                <p className="text-sm text-green-600 mt-2">
                  These complexes are available in the "Inquiry Complex" tab and will inform your AI critics as you write.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WritingArea 
            content={content}
            onContentChange={onContentChange}
            autoFocus={true}
            feedback={activeFeedback.filter(item => !item.status || item.status === 'active')}
            hoveredFeedback={hoveredFeedback}
          />
        </div>
        
        <div>
          <FeedbackPanel 
            feedback={activeFeedback.filter(item => !item.status || item.status === 'active')}
            isMonitoring={isMonitoring}
            onFeedbackHover={handleFeedbackHover}
            onFeedbackLeave={handleFeedbackLeave}
            hoveredFeedback={hoveredFeedback}
            onDismissSuggestion={dismissSuggestion}
            onMarkSuggestionResolved={markSuggestionResolved}
            isEvaluating={isEvaluating}
            isAnalyzing={isAnalyzing}
            onCreateComplex={handleCreateComplex}
            onApplyInsight={handleApplyInsight}
            onExploreFramework={handleExploreFramework}
            onJumpToText={handleJumpToText}
          />
        </div>
      </div>
      </div>

      {/* Dialectical Sidebar */}
      <DialecticalSidebar
        isOpen={dialecticalSidebarOpen}
        onToggle={handleToggleDialecticalSidebar}
        activeComplexes={activeComplexes}
        dialecticalOpportunities={dialecticalOpportunities}
        onCreateComplex={handleCreateDialecticalComplex}
        onExploreComplex={handleExploreComplex}
        onApplyInsight={handleApplyInsightToWriting}
        onAddressCounterArg={handleAddressCounterArg}
      />
    </>
  );
};

export default WritingInterface;