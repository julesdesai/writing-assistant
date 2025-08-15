import React, { useState, useEffect } from 'react';
import { Plus, Target, Brain, Lightbulb, Search, X, FileText } from 'lucide-react';
import InquiryComplexView from './InquiryComplexView';
import inquiryComplexService from '../../services/inquiryComplexService';
import projectService from '../../services/projectService';

const InquiryComplexManager = ({ content, purpose, project }) => {
  const [complexes, setComplexes] = useState([]);
  const [activeComplexId, setActiveComplexId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtractingThemes, setIsExtractingThemes] = useState(false);
  const [themeExtractionResults, setThemeExtractionResults] = useState(null);
  const [perspectiveOptions, setPerspectiveOptions] = useState(null);
  const [isGeneratingPerspectives, setIsGeneratingPerspectives] = useState(false);

  useEffect(() => {
    loadComplexes();
  }, []);

  const loadComplexes = () => {
    const allComplexes = inquiryComplexService.getAllComplexes();
    setComplexes(allComplexes);
  };

  const handleGeneratePerspectives = async () => {
    if (!newQuestion.trim()) return;

    setIsGeneratingPerspectives(true);
    try {
      const options = await inquiryComplexService.generatePerspectiveOptions(newQuestion.trim());
      setPerspectiveOptions(options);
    } catch (error) {
      console.error('Failed to generate perspectives:', error);
      alert('Failed to generate perspectives. Please try again.');
    } finally {
      setIsGeneratingPerspectives(false);
    }
  };

  const handleCreateComplex = async (selectedPerspective = null) => {
    const questionToUse = perspectiveOptions?.question || newQuestion.trim();
    if (!questionToUse) return;

    setIsCreating(true);
    try {
      const complex = await inquiryComplexService.createComplex(questionToUse, selectedPerspective);
      setComplexes(prev => [...prev, complex]);
      setActiveComplexId(complex.id);
      setShowCreateForm(false);
      setNewQuestion('');
      setPerspectiveOptions(null);
      
      // Immediately save to project with proper serialization
      if (project) {
        try {
          const allComplexes = inquiryComplexService.getAllComplexes();
          const serializedComplexes = allComplexes.map(c => inquiryComplexService.serializeComplex(c));
          await projectService.updateInquiryComplexes(project.id, serializedComplexes);
          console.log('Complex saved to project immediately after creation');
        } catch (saveError) {
          console.error('Failed to save complex to project:', saveError);
        }
      }
    } catch (error) {
      console.error('Failed to create inquiry complex:', error);
      alert('Failed to create inquiry complex. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleExpandNode = async (complexId, nodeId, expansionType) => {
    try {
      const newNodeIds = await inquiryComplexService.expandNode(complexId, nodeId, expansionType);
      loadComplexes(); // Refresh the complexes to show new nodes
      
      // Immediately save to project after expansion with proper serialization
      if (project) {
        try {
          const allComplexes = inquiryComplexService.getAllComplexes();
          const serializedComplexes = allComplexes.map(c => inquiryComplexService.serializeComplex(c));
          await projectService.updateInquiryComplexes(project.id, serializedComplexes);
          console.log('Complex saved to project after node expansion');
        } catch (saveError) {
          console.error('Failed to save expanded complex to project:', saveError);
        }
      }
      
      return newNodeIds;
    } catch (error) {
      console.error('Failed to expand node:', error);
      throw error;
    }
  };

  const handleDeleteComplex = async (complexId) => {
    if (window.confirm('Are you sure you want to delete this inquiry complex?')) {
      inquiryComplexService.deleteComplex(complexId);
      setComplexes(prev => prev.filter(c => c.id !== complexId));
      if (activeComplexId === complexId) {
        setActiveComplexId(null);
      }
      
      // Immediately save to project after deletion with proper serialization
      if (project) {
        try {
          const allComplexes = inquiryComplexService.getAllComplexes();
          const serializedComplexes = allComplexes.map(c => inquiryComplexService.serializeComplex(c));
          await projectService.updateInquiryComplexes(project.id, serializedComplexes);
          console.log('Complex deletion saved to project');
        } catch (saveError) {
          console.error('Failed to save complex deletion to project:', saveError);
        }
      }
    }
  };

  const handleAnalyzeComplex = async (complexId) => {
    setIsAnalyzing(true);
    try {
      const analysis = await inquiryComplexService.analyzeComplex(complexId);
      setAnalysisResults({ complexId, analysis });
    } catch (error) {
      console.error('Failed to analyze complex:', error);
      alert('Failed to analyze complex. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExtractThemes = async () => {
    if (!content || content.length < 200) {
      alert('You need at least 200 characters of written content to extract themes.');
      return;
    }

    // Count existing theme-based complexes
    const existingThemeComplexes = complexes.filter(c => c.metadata?.extractedTheme);
    
    setIsExtractingThemes(true);
    try {
      const extractionResults = await inquiryComplexService.extractThemesFromText(
        content, 
        purpose || 'General writing exploration', 
        5
      );
      
      setThemeExtractionResults(extractionResults);
      loadComplexes(); // Refresh to show new complexes
      
      // Immediately save to project after theme extraction with proper serialization
      if (project) {
        try {
          const allComplexes = inquiryComplexService.getAllComplexes();
          const serializedComplexes = allComplexes.map(c => inquiryComplexService.serializeComplex(c));
          await projectService.updateInquiryComplexes(project.id, serializedComplexes);
          console.log('Theme-extracted complexes saved to project');
        } catch (saveError) {
          console.error('Failed to save theme-extracted complexes to project:', saveError);
        }
      }
      
    } catch (error) {
      console.error('Failed to extract themes:', error);
      alert(`Failed to extract themes: ${error.message}`);
    } finally {
      setIsExtractingThemes(false);
    }
  };

  const activeComplex = complexes.find(c => c.id === activeComplexId);

  const sampleQuestions = [
    "Is artificial intelligence fundamentally changing what it means to be human?",
    "Should we prioritize individual freedom or collective well-being in society?",
    "Is objective moral truth possible, or is all ethics relative?",
    "What is the relationship between consciousness and physical reality?",
    "How should we balance technological progress with environmental preservation?"
  ];

  if (activeComplex) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
          <button
            onClick={() => setActiveComplexId(null)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Back to Inquiry Complexes</span>
        </div>
        
        <InquiryComplexView
          complex={activeComplex}
          onExpandNode={handleExpandNode}
          onDeleteComplex={handleDeleteComplex}
          onAnalyze={handleAnalyzeComplex}
          isAnalyzing={isAnalyzing}
        />

        {/* Analysis Results Modal */}
        {analysisResults && analysisResults.complexId === activeComplexId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  Complex Analysis
                </h3>
                <button
                  onClick={() => setAnalysisResults(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-sm text-blue-700 font-medium">Overall Strength</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {Math.round(analysisResults.analysis.overallStrength * 100)}%
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-sm text-green-700 font-medium">Coherence Score</div>
                    <div className="text-2xl font-bold text-green-800">
                      {Math.round(analysisResults.analysis.coherenceScore * 100)}%
                    </div>
                  </div>
                </div>

                {analysisResults.analysis.keyInsights && (
                  <div>
                    <h4 className="font-medium mb-2">Key Insights</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {analysisResults.analysis.keyInsights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResults.analysis.suggestions && (
                  <div>
                    <h4 className="font-medium mb-2">Suggestions for Further Exploration</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      {analysisResults.analysis.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Theme Extraction Results Modal */}
        {themeExtractionResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Themes Extracted from Your Writing
                </h3>
                <button
                  onClick={() => setThemeExtractionResults(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-sm text-blue-700 font-medium">Content Analyzed</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {themeExtractionResults.sourceAnalysis.contentLength} chars
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-sm text-green-700 font-medium">Themes Found</div>
                    <div className="text-2xl font-bold text-green-800">
                      {themeExtractionResults.sourceAnalysis.extractedCount}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="text-sm text-purple-700 font-medium">Complexes Created</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {themeExtractionResults.themes.length}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Extracted Themes</h4>
                  <div className="space-y-3">
                    {themeExtractionResults.themes.map((themeResult, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900">
                            {themeResult.theme.title}
                          </h5>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            {Math.round(themeResult.theme.significance * 100)}% significance
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          {themeResult.theme.description}
                        </p>
                        
                        <div className="mb-2">
                          <div className="text-xs font-medium text-gray-600 mb-1">Inquiry Question:</div>
                          <div className="text-sm italic text-blue-700">
                            "{themeResult.theme.question}"
                          </div>
                        </div>
                        
                        {themeResult.theme.textReferences && themeResult.theme.textReferences.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-600 mb-1">Key References:</div>
                            <div className="flex flex-wrap gap-1">
                              {themeResult.theme.textReferences.map((ref, refIndex) => (
                                <span key={refIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  "{ref.length > 50 ? ref.substring(0, 47) + '...' : ref}"
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2 pt-2 border-t">
                          <button
                            onClick={() => {
                              setActiveComplexId(themeResult.complex.id);
                              setThemeExtractionResults(null);
                            }}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Explore Complex
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inquiry Complexes</h1>
              <p className="text-gray-600">Explore ideas through recursive intellectual networks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {content && content.length >= 200 && (() => {
              const existingThemeCount = complexes.filter(c => c.metadata?.extractedTheme).length;
              return (
                <button
                  onClick={handleExtractThemes}
                  disabled={isExtractingThemes}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isExtractingThemes ? (
                    <Brain className="w-4 h-4 animate-pulse" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {isExtractingThemes ? 'Extracting...' : 
                   existingThemeCount > 0 ? `Extract New Themes (${existingThemeCount} existing)` : 'Extract Themes'}
                </button>
              );
            })()}
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Create New Inquiry Complex
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Central Question
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter a thought-provoking question that invites deep exploration..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">Sample questions:</div>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setNewQuestion(question)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-left"
                    >
                      {question.length > 60 ? question.substring(0, 57) + '...' : question}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {!perspectiveOptions ? (
                  <>
                    <button
                      onClick={handleGeneratePerspectives}
                      disabled={!newQuestion.trim() || isGeneratingPerspectives}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPerspectives ? (
                        <Brain className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      {isGeneratingPerspectives ? 'Generating...' : 'Generate Perspectives'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewQuestion('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setPerspectiveOptions(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  >
                    ← Back to Question
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Perspective Selection */}
        {perspectiveOptions && (
          <div className="border rounded-lg p-4 bg-blue-50 mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Choose Your Perspective
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              Select the intellectual position you'd like to explore for: "{perspectiveOptions.question}"
            </p>
            
            <div className="space-y-3">
              {perspectiveOptions.perspectives.map((perspective, index) => (
                <div
                  key={perspective.id}
                  className="border border-blue-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleCreateComplex(perspective)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-blue-900">
                      {perspective.perspective}
                    </h4>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {Math.round(perspective.strength * 100)}% strength
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {perspective.content}
                  </p>
                  
                  <div className="text-xs text-gray-600">
                    <strong>Reasoning:</strong> {perspective.reasoning}
                  </div>
                  
                  {perspective.tags && perspective.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {perspective.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <button
                      disabled={isCreating}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Select This Perspective'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Complex List */}
      <div className="flex-1 overflow-auto p-6">
        {complexes.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Inquiry Complexes Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first complex to start exploring ideas through recursive intellectual networks.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Complex
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {complexes.map((complex) => (
              <div
                key={complex.id}
                className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  complex.metadata?.extractedTheme 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => setActiveComplexId(complex.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {complex.metadata?.extractedTheme ? (
                      <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    )}
                    {complex.metadata?.extractedTheme && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Theme
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(complex.metadata.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {complex.centralQuestion}
                </h3>
                
                {complex.metadata?.extractedTheme && (
                  <div className="text-xs text-green-700 mb-2 italic">
                    "{complex.metadata.extractedTheme.title}"
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{complex.nodes.size} nodes</span>
                  <span>Depth {complex.metadata.maxDepth}</span>
                </div>
                
                <div className="mt-3 flex gap-1">
                  {Object.entries(complex.metadata.explorationStats.nodesByType).map(([type, count]) => (
                    count > 0 && (
                      <span key={type} className={`text-xs px-2 py-1 rounded-full ${
                        type === 'point' ? 'bg-blue-100 text-blue-700' :
                        type === 'objection' ? 'bg-red-100 text-red-700' :
                        type === 'synthesis' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {count} {type}s
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryComplexManager;