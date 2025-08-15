import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Clock, 
  Edit3, 
  Trash2, 
  Copy,
  ArrowRight,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import projectService from '../../services/projectService';

const ProjectDashboard = ({ onSelectProject, onCreateProject }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('lastAccessed'); // 'lastAccessed', 'created', 'title'

  useEffect(() => {
    loadProjects();
  }, [currentUser]);

  const loadProjects = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userProjects = await projectService.getUserProjects(currentUser.uid);
      setProjects(userProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const newProject = await projectService.createProject(currentUser.uid, {
        title: 'New Project',
        purpose: '',
        content: ''
      });
      
      setProjects(prev => [newProject, ...prev]);
      onCreateProject?.(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleDuplicateProject = async (projectId, e) => {
    e.stopPropagation();
    
    try {
      const duplicatedProject = await projectService.duplicateProject(projectId, currentUser.uid);
      setProjects(prev => [duplicatedProject, ...prev]);
    } catch (error) {
      console.error('Error duplicating project:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredAndSortedProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'lastAccessed':
        default:
          return new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={handleCreateProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Search and Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="lastAccessed">Recent</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>

          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search terms' 
              : 'Create your first writing project to get started'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredAndSortedProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer group ${
                viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {project.purpose || 'No purpose defined'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(project.lastAccessedAt)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Edit3 className="w-3 h-3 mr-1" />
                      {project.content?.length || 0} characters
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDuplicateProject(project.id, e)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Duplicate project"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      {project.inquiryComplexes?.length || 0} complexes
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {project.purpose || 'No purpose defined'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatDate(project.lastAccessedAt)}</span>
                      <span>{project.content?.length || 0} characters</span>
                      <span>{project.inquiryComplexes?.length || 0} complexes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => handleDuplicateProject(project.id, e)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Duplicate project"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;