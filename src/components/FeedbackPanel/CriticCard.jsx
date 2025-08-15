import React, { useState } from 'react';
import { Brain, Palette, AlertCircle, X, Check, Clock, Target, Lightbulb, ArrowRight, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const CriticCard = ({ feedback, onDismiss, onMarkResolved, onCreateComplex, onApplyInsight, onExploreFramework, onJumpToText }) => {
  // Handle cases where feedback might be malformed
  const feedbackData = typeof feedback === 'string' ? { 
    type: 'unknown', 
    severity: 'low', 
    title: 'Raw Response',
    feedback: feedback,
    agent: 'AI Critic'
  } : feedback;

  // Map feedback type to icon and color
  const getIconAndColor = (type, severity) => {
    switch (type) {
      case 'intellectual':
        return { Icon: Brain, color: 'text-purple-600' };
      case 'stylistic':
        return { Icon: Palette, color: 'text-blue-600' };
      case 'complex_suggestion':
        return { Icon: Target, color: 'text-green-600' };
      case 'complex_insight':
        return { Icon: Lightbulb, color: 'text-yellow-600' };
      case 'framework_connection':
        return { Icon: BookOpen, color: 'text-indigo-600' };
      case 'inquiry_integration':
        return { Icon: Target, color: 'text-green-600' };
      default:
        return { Icon: AlertCircle, color: 'text-gray-600' };
    }
  };

  const getSeverityColor = (severity, status, type) => {
    if (status === 'resolved') {
      return 'bg-green-50 border-green-200';
    }
    if (status === 'retracted' || status === 'dismissed') {
      return 'bg-gray-50 border-gray-200 opacity-60';
    }
    
    // Special styling for inquiry integration types
    if (type === 'complex_suggestion' || type === 'inquiry_integration') {
      return 'bg-green-50 border-green-200';
    }
    if (type === 'complex_insight') {
      return 'bg-yellow-50 border-yellow-200';
    }
    if (type === 'framework_connection') {
      return 'bg-indigo-50 border-indigo-200';
    }
    
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'retracted':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'dismissed':
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const { Icon, color } = getIconAndColor(feedbackData.type, feedbackData.severity);
  const severityStyle = getSeverityColor(feedbackData.severity, feedbackData.status, feedbackData.type);
  const statusIcon = getStatusIcon(feedbackData.status);

  // Handle special inquiry integration actions
  const handleSpecialAction = () => {
    const actionData = feedbackData.actionData;
    if (!actionData) return;

    switch (actionData.type) {
      case 'create_complex':
        onCreateComplex?.(actionData.question, actionData.relevantText);
        break;
      case 'apply_insight':
        onApplyInsight?.(actionData.suggestion, actionData.complexId, actionData.nodeId);
        break;
      case 'explore_framework':
        onExploreFramework?.(actionData.framework, actionData.keyAuthorities, actionData.suggestedResources);
        break;
      default:
        console.warn('Unknown action type:', actionData.type);
        break;
    }
  };
  
  return (
    <div className={`border rounded-lg p-4 ${severityStyle} transition-all duration-200`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="font-medium text-slate-800 text-sm">{feedbackData.agent}</span>
        {statusIcon}
        {feedbackData.severity && !feedbackData.status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            feedbackData.severity === 'high' ? 'bg-red-100 text-red-700' :
            feedbackData.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {feedbackData.severity}
          </span>
        )}
        {feedbackData.status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            feedbackData.status === 'resolved' ? 'bg-green-100 text-green-700' :
            feedbackData.status === 'retracted' ? 'bg-gray-100 text-gray-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {feedbackData.status}
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          {/* Special action button for inquiry integration */}
          {feedbackData.actionData && feedbackData.actionData.type && (
            <button
              onClick={handleSpecialAction}
              className={`p-1 rounded transition-colors ${
                feedbackData.actionData.type === 'create_complex' ? 'hover:bg-green-100' :
                feedbackData.actionData.type === 'apply_insight' ? 'hover:bg-yellow-100' :
                'hover:bg-indigo-100'
              }`}
              title={
                feedbackData.actionData.type === 'create_complex' ? 'Create Inquiry Complex' :
                feedbackData.actionData.type === 'apply_insight' ? 'Apply Insight' :
                'Explore Framework'
              }
            >
              <ArrowRight className={`w-3 h-3 ${
                feedbackData.actionData.type === 'create_complex' ? 'text-green-600' :
                feedbackData.actionData.type === 'apply_insight' ? 'text-yellow-600' :
                'text-indigo-600'
              }`} />
            </button>
          )}
          
          {(!feedbackData.status || feedbackData.status === 'active') && (
            <>
              <button
                onClick={() => onMarkResolved && onMarkResolved(feedbackData.id)}
                className="p-1 hover:bg-green-100 rounded transition-colors"
                title="Mark as resolved"
              >
                <Check className="w-3 h-3 text-green-600" />
              </button>
              <button
                onClick={() => onDismiss && onDismiss(feedbackData.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Dismiss suggestion"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </>
          )}
          <span className="text-xs text-slate-500 ml-2">
            {feedbackData.timestamp 
              ? (feedbackData.timestamp instanceof Date 
                  ? feedbackData.timestamp.toLocaleTimeString() 
                  : new Date(feedbackData.timestamp).toLocaleTimeString())
              : 'Now'
            }
          </span>
        </div>
      </div>
      
      {feedbackData.title && (
        <h4 className="font-medium text-slate-800 text-sm mb-1">{feedbackData.title}</h4>
      )}
      
      {feedbackData.status === 'retracted' && feedbackData.retractedReason && (
        <div className="mb-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Auto-retracted:</strong> {feedbackData.retractedReason}
        </div>
      )}
      
      <p className={`text-sm leading-relaxed mb-2 ${
        feedbackData.status === 'retracted' || feedbackData.status === 'dismissed' 
          ? 'text-slate-500' 
          : 'text-slate-700'
      }`}>
        {feedbackData.feedback || feedbackData.message}
      </p>

      {/* Show the problematic text snippet */}
      {feedbackData.positions && feedbackData.positions.length > 0 && feedbackData.positions[0].text && (
        <div 
          className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-gray-300 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onJumpToText && onJumpToText(feedbackData.id)}
          title="Click to jump to this text in the document"
        >
          <div className="text-xs text-gray-600 font-medium mb-1">Referenced text (click to jump):</div>
          <div className="text-sm text-gray-800 italic">
            "{feedbackData.positions[0].text.length > 100 
              ? feedbackData.positions[0].text.substring(0, 100) + '...' 
              : feedbackData.positions[0].text}"
          </div>
        </div>
      )}
      
      {feedbackData.suggestion && (
        <div className={`mt-2 p-2 bg-white rounded border-l-2 ${
          feedbackData.status === 'resolved' ? 'border-green-400' : 
          feedbackData.type === 'complex_suggestion' ? 'border-green-400' :
          feedbackData.type === 'complex_insight' ? 'border-yellow-400' :
          feedbackData.type === 'framework_connection' ? 'border-indigo-400' :
          'border-blue-400'
        }`}>
          <p className="text-sm text-slate-600">
            <strong>Suggestion:</strong> {feedbackData.suggestion}
          </p>
        </div>
      )}


      {/* Special inquiry integration content */}
      {feedbackData.actionData && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
          {feedbackData.actionData.type === 'create_complex' && (
            <div>
              <strong>Suggested Question:</strong> "{feedbackData.actionData.question}"
              {feedbackData.actionData.relevantText && (
                <div className="mt-1 text-gray-600">
                  <strong>Relevant Text:</strong> {feedbackData.actionData.relevantText}
                </div>
              )}
            </div>
          )}
          
          {feedbackData.actionData.type === 'explore_framework' && feedbackData.actionData.keyAuthorities && (
            <div>
              <strong>Key Authorities:</strong> {feedbackData.actionData.keyAuthorities.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CriticCard;