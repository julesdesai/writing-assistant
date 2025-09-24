import React from 'react';
import { Target, Brain, Palette, Send, Loader2, Lightbulb } from 'lucide-react';

const PurposeStep = ({ purpose, setPurpose, onSubmit }) => {
  // Handle both old format (string) and new format (object with topic/context)
  const purposeData = typeof purpose === 'string' ? { topic: purpose, context: '' } : purpose;
  
  const handleSubmit = () => {
    if (!purposeData.topic?.trim()) return;
    onSubmit(purposeData);
  };
  
  const updatePurpose = (field, value) => {
    setPurpose(prev => {
      const current = typeof prev === 'string' ? { topic: prev, context: '' } : prev;
      return { ...current, [field]: value };
    });
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
            <Target className="text-blue-600 w-6 h-6" />
            <h2 className="text-2xl font-semibold text-slate-800">Define Your Writing Purpose</h2>
          </div>
          
          <p className="text-slate-600 mb-6">
            Define what you're writing about and who you're writing for. This will guide our AI critics in providing relevant feedback.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Topic (What are you writing about?)
              </label>
              <textarea
                value={purposeData.topic || ''}
                onChange={(e) => updatePurpose('topic', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Example: The benefits of renewable energy adoption and policy recommendations"
                className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Context (Who are you writing for? What's the setting?)
              </label>
              <textarea
                value={purposeData.context || ''}
                onChange={(e) => updatePurpose('context', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Example: Policymakers and government officials; formal policy brief requiring evidence-based reasoning"
                className="w-full h-24 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>


          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={!purpose.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Start Writing
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mt-2 text-center">
            Press Ctrl+Enter to submit
          </p>
          
        </div>
      </div>
    </div>
  );
};

export default PurposeStep;