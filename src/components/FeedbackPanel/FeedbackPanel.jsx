import React from 'react';
import { MessageSquare, Brain } from 'lucide-react';
import CriticCard from './CriticCard';
import './FeedbackPanel.css';

const FeedbackPanel = ({ 
  feedback, 
  isMonitoring, 
  onFeedbackHover, 
  onFeedbackLeave, 
  hoveredFeedback, 
  onDismissSuggestion, 
  onMarkSuggestionResolved, 
  isEvaluating,
  isAnalyzing,
  onCreateComplex,
  onApplyInsight,
  onExploreFramework,
  onJumpToText
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <MessageSquare className={`w-5 h-5 ${isAnalyzing ? 'text-blue-500 animate-pulse' : 'text-slate-600'}`} />
        <h2 className="font-semibold text-slate-800">AI Critics</h2>
        
        {/* Analysis state indicator */}
        {isAnalyzing && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-600 font-medium">Thinking...</span>
              <div className="flex gap-1">
                <span 
                  className="text-blue-600"
                  style={{
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: '0s'
                  }}
                >
                  .
                </span>
                <span 
                  className="text-blue-600"
                  style={{
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: '0.2s'
                  }}
                >
                  .
                </span>
                <span 
                  className="text-blue-600"
                  style={{
                    animation: 'pulse 1.4s ease-in-out infinite',
                    animationDelay: '0.4s'
                  }}
                >
                  .
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Evaluation state indicator */}
        {isEvaluating && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Brain className="w-3 h-3 animate-pulse" />
            <span>Evaluating...</span>
          </div>
        )}
        
        <span className="ml-auto text-sm text-slate-500">{feedback.length} suggestions</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {feedback.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {isMonitoring ? 'Keep writing to receive feedback...' : 'Critics are paused'}
            </p>
          </div>
        ) : (
          feedback.map((item, index) => (
            <div
              key={item.id || `feedback-${index}`}
              className="feedback-card-enter"
              style={{
                animationDelay: `${Math.min(index * 150, 1000)}ms`, // Cap delay at 1 second
                opacity: 0
              }}
            >
              <CriticCard 
                feedback={item} 
                onDismiss={onDismissSuggestion}
                onMarkResolved={onMarkSuggestionResolved}
                onCreateComplex={onCreateComplex}
                onApplyInsight={onApplyInsight}
                onExploreFramework={onExploreFramework}
                onJumpToText={onJumpToText}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;