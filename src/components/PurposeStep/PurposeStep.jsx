import React from 'react';
import { Target, Brain, Palette, Send, Loader2, Lightbulb } from 'lucide-react';

const PurposeStep = ({ purpose, setPurpose, onSubmit, isGeneratingComplexes }) => {
  const handleSubmit = () => {
    if (!purpose.trim()) return;
    onSubmit(purpose);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Writing Assistant</h1>
          <p className="text-lg text-slate-600">Multi-agent real-time criticism and guidance</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-green-600 w-6 h-6" />
            <h2 className="text-2xl font-semibold text-slate-800">Define Your Writing Purpose</h2>
          </div>
          
          <p className="text-slate-600 mb-6">
            What are you trying to achieve with your writing? This will guide our AI critics in providing relevant feedback.
          </p>

          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Example: I want to write a persuasive essay arguing for renewable energy adoption, targeting policymakers with evidence-based reasoning..."
            className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-800 mb-2">Your AI Critics</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span><strong>Dialectical Critic:</strong> Challenges reasoning and intellectual rigor</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                <span><strong>Style Guide:</strong> Suggests improvements to writing style and flow</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                <span><strong>Inquiry Complex Integration:</strong> Connects your writing to deeper questions</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!purpose.trim() || isGeneratingComplexes}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingComplexes ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Inquiry Complexes...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Start Writing
                </>
              )}
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mt-2 text-center">
            {isGeneratingComplexes 
              ? 'AI is analyzing your purpose to create initial inquiry complexes...'
              : 'Press Ctrl+Enter to submit'
            }
          </p>
          
          {!isGeneratingComplexes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p><strong>✨ New:</strong> When you start writing, we'll automatically generate inquiry complexes from your purpose to deepen your intellectual exploration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurposeStep;