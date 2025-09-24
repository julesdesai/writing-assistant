import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Header = ({ 
  purpose,
  onBackToPurpose
}) => {
  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
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
            {typeof purpose === 'object' && purpose !== null ? (
              <>
                <strong>Topic:</strong> {purpose.topic}
                {purpose.context && (
                  <>
                    {' • '}
                    <strong>Context:</strong> {purpose.context}
                  </>
                )}
              </>
            ) : (
              <>Purpose: {purpose}</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Header;