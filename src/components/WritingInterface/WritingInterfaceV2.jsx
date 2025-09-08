/**
 * Enhanced Writing Interface with Multi-Agent System Integration
 * Provides progressive enhancement, real-time feedback, and advanced agent coordination
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '../Header';
import WritingArea from '../WritingArea';
import FeedbackPanel from '../FeedbackPanel';
import DialecticalSidebar from '../DialecticalSidebar';
import { useMultiAgentAnalysis } from '../../hooks/useMultiAgentAnalysis';
import { createComplexFromWriting, applyComplexInsight } from '../../agents/inquiryIntegrationAgent';
import inquiryComplexService from '../../services/inquiryComplexService';
import { ProgressIndicator } from '../UI/ProgressIndicator';
import { SystemStatusIndicator } from '../UI/SystemStatusIndicator';
import { UserPreferencesPanel } from '../UI/UserPreferencesPanel';

const WritingInterfaceV2 = ({ 
  purpose, 
  content, 
  onContentChange, 
  feedback: legacyFeedback, 
  setFeedback: setLegacyFeedback, 
  onBackToPurpose, 
  project, 
  writingCriteria 
}) => {
  // UI State
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [hoveredFeedback, setHoveredFeedback] = useState(null);
  const [dialecticalSidebarOpen, setDialecticalSidebarOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('progressive'); // 'progressive', 'quick', 'thorough'
  
  // Agent System State
  const [dialecticalOpportunities, setDialecticalOpportunities] = useState([]);
  const [activeComplexes, setActiveComplexes] = useState([]);
  const [initialComplexes, setInitialComplexes] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  
  // Migration State
  const [useLegacySystem, setUseLegacySystem] = useState(false);
  
  // Multi-Agent System Integration
  const {
    analyze,
    analyzeDebounced,
    quickAnalyze,
    thoroughAnalyze,
    results,
    fastResults,
    enhancedResults,
    loading,
    error,
    progress,
    analysisHistory,
    systemReady,
    isEnhancing,
    provideFeedback,
    getMetrics,
    system
  } = useMultiAgentAnalysis({
    enableProgressiveEnhancement: true,
    defaultUrgency: analysisMode === 'quick' ? 'realtime' : 'normal',
    defaultBudget: analysisMode === 'thorough' ? 'premium' : 'standard',
    autoAnalyze: isMonitoring,
    debounceMs: 800,
    enableFallback: true
  });

  // Convert multi-agent results to legacy format for compatibility
  const convertedFeedback = useMemo(() => {
    if (!results || !results.insights) return [];
    
    return results.insights.map((insight, index) => ({
      id: insight.id || `insight-${index}-${Date.now()}`,
      type: insight.type || 'general',
      agent: insight.agent || 'Multi-Agent System',
      severity: insight.severity || 'medium',
      title: insight.title || 'Suggestion',
      feedback: insight.feedback || insight.message || '',
      suggestion: insight.suggestion || insight.quickFix || '',
      positions: insight.positions || insight.textSnippets?.map(snippet => ({
        start: content.indexOf(snippet),
        end: content.indexOf(snippet) + snippet.length,
        text: snippet
      })) || [],
      timestamp: new Date(),
      status: 'active',
      confidence: insight.confidence,
      priority: insight.priority,
      enhancement: insight.enhancement,
      sourceAgent: insight.sourceAgent,
      actionData: insight.actionData
    }));
  }, [results, content]);

  // Trigger analysis when content changes
  useEffect(() => {
    if (!isMonitoring || !content?.trim()) return;

    if (analysisMode === 'quick') {
      analyzeDebounced(content, { 
        purpose, 
        writingCriteria,
        urgency: 'realtime'
      });
    } else {
      analyzeDebounced(content, { 
        purpose, 
        writingCriteria 
      });
    }
  }, [content, isMonitoring, analysisMode, purpose, writingCriteria, analyzeDebounced]);

  // Load initial complexes
  useEffect(() => {
    const complexes = inquiryComplexService.getAllComplexes();
    setInitialComplexes(complexes);
    setActiveComplexes(complexes);
  }, []);

  // Update system metrics periodically
  useEffect(() => {
    if (!systemReady) return;
    
    const updateMetrics = () => {
      const metrics = getMetrics();
      setSystemMetrics(metrics);
    };
    
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [systemReady, getMetrics]);

  // Extract dialectical opportunities
  useEffect(() => {
    const opportunities = convertedFeedback.filter(item => 
      item.type === 'dialectical_opportunity' || 
      item.type === 'complex_suggestion' ||
      (item.type === 'intellectual' && item.actionData?.type === 'dialectical_guide')
    );
    setDialecticalOpportunities(opportunities);
  }, [convertedFeedback]);

  // Analysis mode handlers
  const handleQuickAnalysis = useCallback(async () => {
    if (!content?.trim()) return;
    setAnalysisMode('quick');
    await quickAnalyze(content, { purpose, writingCriteria });
  }, [content, purpose, writingCriteria, quickAnalyze]);

  const handleThoroughAnalysis = useCallback(async () => {
    if (!content?.trim()) return;
    setAnalysisMode('thorough');
    await thoroughAnalyze(content, { purpose, writingCriteria });
  }, [content, purpose, writingCriteria, thoroughAnalyze]);

  const handleProgressiveAnalysis = useCallback(async () => {
    if (!content?.trim()) return;
    setAnalysisMode('progressive');
    await analyze(content, { 
      purpose, 
      writingCriteria,
      urgency: 'normal',
      budget: 'standard'
    });
  }, [content, purpose, writingCriteria, analyze]);

  // Feedback handlers
  const handleToggleMonitoring = useCallback(() => {
    setIsMonitoring(!isMonitoring);
  }, [isMonitoring]);

  const handleFeedbackHover = useCallback((feedbackId) => {
    setHoveredFeedback(feedbackId);
  }, []);

  const handleFeedbackLeave = useCallback(() => {
    setHoveredFeedback(null);
  }, []);

  const handleDismissSuggestion = useCallback((feedbackId) => {
    // Remove from converted feedback (in real implementation, would update the results)
    provideFeedback({
      action: 'dismiss',
      feedbackId,
      rating: 1 // Low rating for dismissed suggestions
    });
  }, [provideFeedback]);

  const handleMarkResolved = useCallback((feedbackId) => {
    provideFeedback({
      action: 'resolve',
      feedbackId,
      rating: 4 // Good rating for resolved suggestions
    });
  }, [provideFeedback]);

  const handleUserFeedback = useCallback((feedbackData) => {
    provideFeedback(feedbackData);
  }, [provideFeedback]);

  // Clear all feedback
  const handleClearFeedback = useCallback(() => {
    // In a real implementation, this would clear the analysis results
    console.log('Clear feedback - would reset analysis');
  }, []);

  // Inquiry integration handlers (similar to original)
  const handleCreateComplex = useCallback(async (question, relevantText) => {
    try {
      const complex = await createComplexFromWriting(question, relevantText || content, purpose);
      const updatedComplexes = inquiryComplexService.getAllComplexes();
      setActiveComplexes(updatedComplexes);
    } catch (error) {
      console.error('Failed to create complex:', error);
    }
  }, [content, purpose]);

  const handleApplyInsight = useCallback(async (suggestion, complexId, nodeId) => {
    try {
      const applicationSuggestions = await applyComplexInsight(content, suggestion, complexId, nodeId);
      console.log('Insight application suggestions:', applicationSuggestions);
    } catch (error) {
      console.error('Failed to apply insight:', error);
    }
  }, [content]);

  // Dialectical sidebar handlers
  const handleToggleDialecticalSidebar = useCallback(() => {
    setDialecticalSidebarOpen(!dialecticalSidebarOpen);
  }, [dialecticalSidebarOpen]);

  const handleCreateDialecticalComplex = useCallback(async (actionData) => {
    try {
      const { claim, suggestedCounterArgs } = actionData;
      const question = `Is the following claim valid: "${claim}"?`;
      const complex = await createComplexFromWriting(question, content, purpose);
      
      if (suggestedCounterArgs && suggestedCounterArgs.length > 0) {
        for (const counterArg of suggestedCounterArgs) {
          await inquiryComplexService.addNode(complex.id, counterArg, 'refutation');
        }
      }
      
      const updatedComplexes = inquiryComplexService.getAllComplexes();
      setActiveComplexes(updatedComplexes);
    } catch (error) {
      console.error('Failed to create dialectical complex:', error);
    }
  }, [content, purpose]);

  const handleJumpToText = useCallback((feedbackId) => {
    const feedbackItem = convertedFeedback.find(f => f.id === feedbackId);
    if (feedbackItem && feedbackItem.positions && feedbackItem.positions.length > 0) {
      setHoveredFeedback(feedbackId);
      setTimeout(() => setHoveredFeedback(null), 2000);
    }
  }, [convertedFeedback]);

  // Render progress indicator
  const renderProgress = () => {
    if (!loading && !isEnhancing) return null;

    return (
      <ProgressIndicator
        loading={loading}
        isEnhancing={isEnhancing}
        progress={progress}
        fastComplete={Boolean(fastResults)}
        enhancedComplete={Boolean(enhancedResults)}
        stage={results?.analysisPhase || 'initializing'}
      />
    );
  };

  // Render system status
  const renderSystemStatus = () => {
    if (!systemReady) return null;

    return (
      <SystemStatusIndicator
        systemReady={systemReady}
        metrics={systemMetrics}
        error={error}
        analysisMode={analysisMode}
        onModeChange={setAnalysisMode}
      />
    );
  };

  // Active feedback for display
  const activeFeedback = useLegacySystem ? (legacyFeedback || []) : convertedFeedback;

  return (
    <>
      <Header 
        purpose={purpose}
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        onClearFeedback={handleClearFeedback}
        onBackToPurpose={onBackToPurpose}
        onDocumentAnalysis={handleThoroughAnalysis}
        isDocumentAnalyzing={loading && analysisMode === 'thorough'}
        systemV2={true}
        onQuickAnalysis={handleQuickAnalysis}
        onProgressiveAnalysis={handleProgressiveAnalysis}
        onShowPreferences={() => setShowPreferences(true)}
        useLegacySystem={useLegacySystem}
        onToggleLegacySystem={() => setUseLegacySystem(!useLegacySystem)}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-4">
        
        {/* System Status Bar */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div className="flex items-center space-x-4">
            {renderSystemStatus()}
            {renderProgress()}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {results && (
              <span className="bg-white px-2 py-1 rounded">
                {results.insights?.length || 0} insights
              </span>
            )}
            {isEnhancing && (
              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded animate-pulse">
                Enhancing...
              </span>
            )}
          </div>
        </div>

        {/* Initial Complexes Notification */}
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
                  Multi-agent system is using these complexes to provide contextual analysis.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WritingArea 
              content={content}
              onContentChange={onContentChange}
              autoFocus={true}
              feedback={activeFeedback.filter(item => !item.status || item.status === 'active')}
              hoveredFeedback={hoveredFeedback}
              systemV2={true}
              progress={progress}
            />
          </div>
          
          <div>
            <FeedbackPanel 
              feedback={activeFeedback.filter(item => !item.status || item.status === 'active')}
              isMonitoring={isMonitoring}
              onFeedbackHover={handleFeedbackHover}
              onFeedbackLeave={handleFeedbackLeave}
              hoveredFeedback={hoveredFeedback}
              onDismissSuggestion={handleDismissSuggestion}
              onMarkSuggestionResolved={handleMarkResolved}
              isEvaluating={loading}
              isAnalyzing={loading}
              onCreateComplex={handleCreateComplex}
              onApplyInsight={handleApplyInsight}
              onJumpToText={handleJumpToText}
              systemV2={true}
              fastResults={fastResults}
              enhancedResults={enhancedResults}
              isEnhancing={isEnhancing}
              analysisHistory={analysisHistory}
              onProvideFeedback={handleUserFeedback}
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
        onExploreComplex={(complexId) => console.log('Explore complex:', complexId)}
        onApplyInsight={(insightData) => console.log('Apply insight:', insightData)}
        onAddressCounterArg={(actionData) => console.log('Address counter-arg:', actionData)}
      />

      {/* User Preferences Panel */}
      {showPreferences && (
        <UserPreferencesPanel
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
          system={system}
          onPreferencesChange={handleUserFeedback}
          metrics={systemMetrics}
        />
      )}
    </>
  );
};

export default WritingInterfaceV2;