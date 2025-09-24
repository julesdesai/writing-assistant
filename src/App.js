import React, { useState, useEffect } from 'react';
import { Pen, Target, Home, User, LogOut, Bot } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/Auth/AuthModal';
import ProjectDashboard from './components/Projects/ProjectDashboard';
import PurposeWithCriteriaStep from './components/PurposeStep/PurposeWithCriteriaStep';
import WritingInterface from './components/WritingInterface';
import InquiryComplexManager from './components/InquiryComplex/InquiryComplexManager';
import AgentInterface from './components/AgentInterface/AgentInterface';
import { extractInitialComplexes } from './agents/inquiryIntegrationAgent';
import inquiryComplexService from './services/inquiryComplexService';
import projectService from './services/projectService';

function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentMode, setCurrentMode] = useState('dashboard'); // 'dashboard' | 'home' | 'writing' | 'inquiry' | 'agents'
  const [currentProject, setCurrentProject] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [content, setContent] = useState(''); // Lift content state to App level
  const [feedback, setFeedback] = useState([]); // Lift feedback state to App level
  const [writingCriteria, setWritingCriteria] = useState(null); // Store writing criteria
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isMonitoring, setIsMonitoring] = useState(true); // Global monitoring state for agents

  // Auto-save project content and feedback
  useEffect(() => {
    if (!currentProject || !currentUser) return;
    
    const autoSaveInterval = setInterval(async () => {
      const hasContentChanges = content !== currentProject.content;
      const hasFeedbackChanges = JSON.stringify(feedback) !== JSON.stringify(currentProject.feedback || []);
      
      // Check for inquiry complex changes
      const currentComplexes = inquiryComplexService.getAllComplexes();
      const hasComplexChanges = JSON.stringify(currentComplexes.map(c => c.id)) !== 
        JSON.stringify((currentProject.inquiryComplexes || []).map(c => c.id));
      
      // Check for writing criteria changes
      const hasCriteriaChanges = JSON.stringify(writingCriteria) !== JSON.stringify(currentProject.writingCriteria);
      
      if (hasContentChanges || hasFeedbackChanges || hasComplexChanges || hasCriteriaChanges) {
        try {
          // Save complexes to project first if they changed
          if (hasComplexChanges && currentComplexes.length > 0) {
            console.log('Auto-saving inquiry complexes:', currentComplexes.length);
            const serializedComplexes = currentComplexes.map(c => inquiryComplexService.serializeComplex(c));
            await projectService.updateInquiryComplexes(currentProject.id, serializedComplexes);
          }
          
          // Save writing criteria if they changed
          if (hasCriteriaChanges) {
            console.log('Auto-saving writing criteria');
            await projectService.updateWritingCriteria(currentProject.id, writingCriteria);
          }
          
          // Then save other project data
          await projectService.updateProject(currentProject.id, {
            content,
            feedback,
            purpose
          });
          
          // Update current project reference to avoid repeated saves
          const serializedComplexes = currentComplexes.map(c => inquiryComplexService.serializeComplex(c));
          setCurrentProject(prev => ({
            ...prev,
            content,
            feedback: [...feedback],
            purpose,
            writingCriteria,
            inquiryComplexes: serializedComplexes
          }));
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [currentProject, currentUser, content, feedback, purpose, writingCriteria]);

  const handleSelectProject = async (project) => {
    try {
      console.log('Loading project:', project);
      setCurrentProject(project);
      setPurpose(project.purpose || '');
      setContent(project.content || '');
      setFeedback(project.feedback || []); // Load saved feedback
      setWritingCriteria(project.writingCriteria || null); // Load saved writing criteria
      
      // Clear existing complexes and load complexes for this project
      inquiryComplexService.clearAll();
      if (project.inquiryComplexes && project.inquiryComplexes.length > 0) {
        console.log('Loading inquiry complexes:', project.inquiryComplexes);
        // Load complexes into the inquiry complex service
        project.inquiryComplexes.forEach((complex, index) => {
          try {
            inquiryComplexService.loadComplex(complex);
            console.log(`Loaded complex ${index + 1}:`, complex.centralQuestion);
          } catch (error) {
            console.error(`Failed to load complex ${index + 1}:`, error);
          }
        });
      } else {
        console.log('No inquiry complexes to load for this project');
      }
      
      setCurrentMode(project.purpose ? 'writing' : 'home');
      console.log('Project loaded successfully, mode set to:', project.purpose ? 'writing' : 'home');
    } catch (error) {
      console.error('Error in handleSelectProject:', error);
      // Still try to continue with basic project setup
      setCurrentProject(project);
      setPurpose(project.purpose || '');
      setContent(project.content || '');
      setFeedback([]);
      setWritingCriteria(null); // Clear criteria for error state
      inquiryComplexService.clearAll(); // Clear complexes for error state
      setCurrentMode('home');
    }
  };

  const handleCreateProject = (project) => {
    setCurrentProject(project);
    setPurpose('');
    setContent('');
    setFeedback([]); // Clear feedback for new project
    setWritingCriteria(null); // Clear criteria for new project
    inquiryComplexService.clearAll(); // Clear complexes for new project
    setCurrentMode('home');
  };

  const handlePurposeSubmit = async (purposeText, criteria = null) => {
    setPurpose(purposeText);
    setWritingCriteria(criteria);
    
    // Generate title from purpose (handle both string and object formats)
    let projectTitle = 'Untitled Project';
    if (typeof purposeText === 'object' && purposeText !== null) {
      projectTitle = purposeText.topic?.substring(0, 50) || 'Untitled Project';
    } else if (typeof purposeText === 'string') {
      projectTitle = purposeText.split('.')[0].substring(0, 50) || 'Untitled Project';
    }
    
    // Update current project with purpose and criteria
    if (currentProject) {
      await projectService.updateProject(currentProject.id, {
        purpose: purposeText,
        title: projectTitle
      });
      
      // Save writing criteria separately if provided
      if (criteria) {
        await projectService.updateWritingCriteria(currentProject.id, criteria);
      }
    }
    
    
    setCurrentMode('writing');
  };

  const handleBackToHome = () => {
    setCurrentMode(currentProject ? 'home' : 'dashboard');
  };

  const handleBackToDashboard = () => {
    // Save current project before going back
    if (currentProject && (content !== currentProject.content || purpose !== currentProject.purpose || JSON.stringify(feedback) !== JSON.stringify(currentProject.feedback || []))) {
      projectService.updateProject(currentProject.id, {
        content,
        purpose,
        feedback, // Save current feedback
        title: typeof purpose === 'object' && purpose !== null 
          ? (purpose.topic?.substring(0, 50) || currentProject.title)
          : (purpose?.split('.')[0].substring(0, 50) || currentProject.title)
      }).catch(error => console.error('Failed to save project:', error));
    }
    
    setCurrentMode('dashboard');
    setCurrentProject(null);
    setPurpose('');
    setContent('');
    setFeedback([]); // Clear feedback when leaving project
    setWritingCriteria(null); // Clear criteria when leaving project
    inquiryComplexService.clearAll(); // Clear complexes when leaving project
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentMode('dashboard');
      setCurrentProject(null);
      setPurpose('');
      setContent('');
      inquiryComplexService.clearAll(); // Clear complexes on logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show auth modal if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">AI Writing Assistant</h1>
          <p className="text-slate-600 mb-8">Sign in to access your writing projects and inquiry complexes</p>
          
          <div className="space-y-3">
            <button
              onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
        
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <Home className="w-5 h-5" />
            <span className="font-semibold">My Projects</span>
          </button>
          {currentProject && (
            <span className="text-gray-400 mx-2">/</span>
          )}
          {currentProject && (
            <span className="text-gray-700 font-medium">{currentProject.title}</span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {currentProject && (
            <>
              <button
                onClick={() => setCurrentMode('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentMode === 'home' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Purpose</span>
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
                disabled={!purpose}
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
              
              <button
                onClick={() => setCurrentMode('agents')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentMode === 'agents' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Agents</span>
              </button>
            </>
          )}
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>{currentUser.displayName || currentUser.email}</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {currentMode !== 'dashboard' && renderNavigation()}
      
      <div className={currentMode !== 'dashboard' ? 'h-[calc(100vh-80px)]' : 'h-screen'}>
        {currentMode === 'dashboard' ? (
          <ProjectDashboard 
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
          />
        ) : currentMode === 'home' ? (
          <PurposeWithCriteriaStep 
            purpose={purpose}
            setPurpose={setPurpose}
            onSubmit={handlePurposeSubmit}
          />
        ) : currentMode === 'writing' ? (
          <WritingInterface 
            purpose={purpose}
            content={content}
            onContentChange={setContent}
            feedback={feedback}
            setFeedback={setFeedback}
            onBackToPurpose={handleBackToHome}
            project={currentProject}
            writingCriteria={writingCriteria}
            isMonitoring={isMonitoring}
            onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
          />
        ) : currentMode === 'agents' ? (
          <AgentInterface 
            content={content}
            purpose={purpose}
            writingCriteria={writingCriteria}
            isMonitoring={isMonitoring}
            onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
            onClearFeedback={() => setFeedback([])}
          />
        ) : (
          <InquiryComplexManager 
            content={content}
            purpose={purpose}
            project={currentProject}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;