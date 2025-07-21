import React, { useState } from 'react';
import { Pen, Target, Home } from 'lucide-react';
import PurposeStep from './components/PurposeStep';
import WritingInterface from './components/WritingInterface';
import InquiryComplexManager from './components/InquiryComplex/InquiryComplexManager';
import { extractInitialComplexes } from './agents/inquiryIntegrationAgent';
import inquiryComplexService from './services/inquiryComplexService';

function App() {
  const [currentMode, setCurrentMode] = useState('home'); // 'home' | 'writing' | 'inquiry'
  const [purpose, setPurpose] = useState('');
  const [isGeneratingComplexes, setIsGeneratingComplexes] = useState(false);

  const handlePurposeSubmit = async (purposeText) => {
    setPurpose(purposeText);
    
    // Generate initial inquiry complexes from the purpose
    setIsGeneratingComplexes(true);
    try {
      const complexSuggestions = await extractInitialComplexes(purposeText);
      
      // Create the suggested complexes
      for (const suggestion of complexSuggestions) {
        try {
          await inquiryComplexService.createComplex(suggestion.question);
          console.log(`Created initial complex: "${suggestion.question}"`);
        } catch (error) {
          console.warn(`Failed to create complex for "${suggestion.question}":`, error);
        }
      }
      
      if (complexSuggestions.length > 0) {
        console.log(`Generated ${complexSuggestions.length} initial inquiry complexes from purpose`);
      }
    } catch (error) {
      console.error('Failed to generate initial complexes:', error);
    } finally {
      setIsGeneratingComplexes(false);
    }
    
    setCurrentMode('writing');
  };

  const handleBackToHome = () => {
    setCurrentMode('home');
  };

  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMode('home')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">Writing Assistant</span>
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMode('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentMode === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              if (!purpose) {
                setCurrentMode('home');
              } else {
                setCurrentMode('writing');
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentMode === 'writing' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Pen className="w-4 h-4" />
            <span>Writing</span>
          </button>
          
          <button
            onClick={() => setCurrentMode('inquiry')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentMode === 'inquiry' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Inquiry Complex</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentMode !== 'home' && renderNavigation()}
      
      <div className={currentMode !== 'home' ? 'h-[calc(100vh-80px)]' : 'h-screen'}>
        {currentMode === 'home' ? (
          <PurposeStep 
            purpose={purpose}
            setPurpose={setPurpose}
            onSubmit={handlePurposeSubmit}
            onInquiryMode={() => setCurrentMode('inquiry')}
            isGeneratingComplexes={isGeneratingComplexes}
          />
        ) : currentMode === 'writing' ? (
          <WritingInterface 
            purpose={purpose}
            onBackToPurpose={handleBackToHome}
          />
        ) : (
          <InquiryComplexManager />
        )}
      </div>
    </div>
  );
}

export default App;