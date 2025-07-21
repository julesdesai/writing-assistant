import React, { useState, useEffect } from 'react';
import Header from '../Header';
import WritingArea from '../WritingArea';
import FeedbackPanel from '../FeedbackPanel';
import { useWritingAnalysis } from '../../hooks/useWritingAnalysis';
import { createComplexFromWriting, applyComplexInsight } from '../../agents/inquiryIntegrationAgent';
import inquiryComplexService from '../../services/inquiryComplexService';

const WritingInterface = ({ purpose, onBackToPurpose }) => {
  const [content, setContent] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [hoveredFeedback, setHoveredFeedback] = useState(null);
  const [initialComplexes, setInitialComplexes] = useState([]);
  
  const { feedback, clearFeedback, dismissSuggestion, markSuggestionResolved, isEvaluating } = useWritingAnalysis(content, purpose, isMonitoring);

  // Load initial complexes when component mounts
  useEffect(() => {
    const complexes = inquiryComplexService.getAllComplexes();
    setInitialComplexes(complexes);
  }, []);

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

  const handleExploreFramework = (framework, keyThinkers, suggestedReading) => {
    console.log('Framework exploration:', { framework, keyThinkers, suggestedReading });
    // Optionally show a modal with framework information or navigate to resources
  };

  return (
    <>
      <Header 
        purpose={purpose}
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        onClearFeedback={clearFeedback}
        onBackToPurpose={onBackToPurpose}
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
            onContentChange={setContent}
            autoFocus={true}
            feedback={feedback}
            hoveredFeedback={hoveredFeedback}
          />
        </div>
        
        <div>
          <FeedbackPanel 
            feedback={feedback}
            isMonitoring={isMonitoring}
            onFeedbackHover={handleFeedbackHover}
            onFeedbackLeave={handleFeedbackLeave}
            hoveredFeedback={hoveredFeedback}
            onDismissSuggestion={dismissSuggestion}
            onMarkSuggestionResolved={markSuggestionResolved}
            isEvaluating={isEvaluating}
            onCreateComplex={handleCreateComplex}
            onApplyInsight={handleApplyInsight}
            onExploreFramework={handleExploreFramework}
          />
        </div>
      </div>
      </div>
    </>
  );
};

export default WritingInterface;