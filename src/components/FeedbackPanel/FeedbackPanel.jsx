import React from 'react';
import { MessageSquare, Brain } from 'lucide-react';
import CriticCard from './CriticCard';

const FeedbackPanel = ({ 
  feedback, 
  isMonitoring, 
  onFeedbackHover, 
  onFeedbackLeave, 
  hoveredFeedback, 
  onDismissSuggestion, 
  onMarkSuggestionResolved, 
  isEvaluating,
  onCreateComplex,
  onApplyInsight,
  onExploreFramework
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        <h2 className="font-semibold text-slate-800">AI Critics</h2>
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
          feedback.map((item) => (
            <div
              key={item.id}
              onMouseEnter={() => onFeedbackHover && onFeedbackHover(item.id)}
              onMouseLeave={() => onFeedbackLeave && onFeedbackLeave()}
              className={`transition-all duration-200 ${
                hoveredFeedback === item.id ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
              }`}
            >
              <CriticCard 
                feedback={item} 
                onDismiss={onDismissSuggestion}
                onMarkResolved={onMarkSuggestionResolved}
                onCreateComplex={onCreateComplex}
                onApplyInsight={onApplyInsight}
                onExploreFramework={onExploreFramework}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;