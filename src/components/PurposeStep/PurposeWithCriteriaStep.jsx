import React, { useState } from 'react';
import { Target, Brain, Palette, Send, Loader2, ArrowRight, Settings } from 'lucide-react';
import WritingCriteriaEditor from '../WritingCriteria/WritingCriteriaEditor';

const PurposeWithCriteriaStep = ({ purpose, setPurpose, onSubmit, isGeneratingComplexes }) => {
  const [step, setStep] = useState('purpose'); // 'purpose' or 'criteria'
  const [criteria, setCriteria] = useState(null);

  const handlePurposeSubmit = () => {
    if (!purpose.trim()) return;
    setStep('criteria');
  };

  const handleFinalSubmit = () => {
    onSubmit(purpose, criteria);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && step === 'purpose') {
      handlePurposeSubmit();
    }
  };

  if (step === 'criteria') {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Customize Your Quality Criteria</h1>
            <p className="text-lg text-slate-600">AI has generated writing criteria based on your purpose. Review and customize them.</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Your Writing Purpose</h3>
                <p className="text-blue-700 text-sm leading-relaxed">{purpose}</p>
              </div>
            </div>
            <button
              onClick={() => setStep('purpose')}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              Edit Purpose
            </button>
          </div>

          <WritingCriteriaEditor
            purpose={purpose}
            onCriteriaChange={setCriteria}
          />

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep('purpose')}
              className="px-6 py-3 text-slate-600 hover:text-slate-800 flex items-center gap-2 transition-colors"
            >
              ← Back to Purpose
            </button>

            <button
              onClick={handleFinalSubmit}
              disabled={!criteria || isGeneratingComplexes}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGeneratingComplexes ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Complexes...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Start Writing with Custom Criteria
                </>
              )}
            </button>
          </div>

          {criteria && !isGeneratingComplexes && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500">
                Your AI critics will use these {Object.values(criteria).flat().filter(c => c?.enabled).length} criteria to provide targeted feedback
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Purpose definition step
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
            What are you trying to achieve with your writing? We'll generate personalized quality criteria based on your purpose.
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

          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              ✨ Smart Quality Criteria
            </h3>
            <p className="text-sm text-green-700">
              Based on your purpose, we'll generate specific quality criteria that your AI critics will use to provide targeted, relevant feedback.
            </p>
          </div>

          <div className="mt-6">
            <button
              onClick={handlePurposeSubmit}
              disabled={!purpose.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Generate Quality Criteria
            </button>
          </div>
          
          <p className="text-sm text-slate-500 mt-2 text-center">
            Next: Review and customize your writing criteria
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurposeWithCriteriaStep;