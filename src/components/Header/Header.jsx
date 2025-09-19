import React from 'react';
import { Play, Pause, ArrowLeft, FileText, Settings } from 'lucide-react';

const Header = ({ 
  purpose, 
  isMonitoring, 
  onToggleMonitoring, 
  onClearFeedback, 
  onBackToPurpose,
  onDocumentAnalysis,
  isDocumentAnalyzing,
  onOpenAgentCustomization,
  customizationSummary = { total: 0, customizedBuiltIn: 0, dynamicAgents: 0 }
}) => {
  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToPurpose}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Writing Assistant</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Purpose: {purpose}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onOpenAgentCustomization && (
            <button
              onClick={onOpenAgentCustomization}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium transition-colors relative"
              title="Customize Agents & Prompts"
            >
              <Settings className="w-4 h-4" />
              Agent Settings
              {customizationSummary.total > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {customizationSummary.total}
                </span>
              )}
            </button>
          )}
          <button
            onClick={onDocumentAnalysis}
            disabled={isDocumentAnalyzing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isDocumentAnalyzing
                ? 'bg-blue-50 text-blue-400 cursor-not-allowed'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <FileText className={`w-4 h-4 ${isDocumentAnalyzing ? 'animate-pulse' : ''}`} />
            {isDocumentAnalyzing ? 'Analyzing Document...' : 'Full Document Analysis'}
          </button>
          <button
            onClick={onToggleMonitoring}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isMonitoring ? 'Pause Critics' : 'Resume Critics'}
          </button>
          <button
            onClick={onClearFeedback}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Clear Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;