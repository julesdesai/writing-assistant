import React from 'react';
import { Play, Pause, ArrowLeft } from 'lucide-react';

const Header = ({ 
  purpose, 
  isMonitoring, 
  onToggleMonitoring, 
  onClearFeedback, 
  onBackToPurpose 
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