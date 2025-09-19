/**
 * Unified Agent Customization Panel
 * Combines prompt customization for built-in agents and full dynamic agent creation
 */

import React, { useState, useEffect } from 'react';
import unifiedAgentCustomizationService, { CUSTOMIZATION_LEVELS, AGENT_TYPES } from '../../services/unifiedAgentCustomizationService';
import { AGENT_CATEGORIES, PERSONA_TYPES, OUTPUT_FORMATS } from '../../agents/AgentTemplates';
import { MODEL_TIERS } from '../../agents/BaseAgent';

export const UnifiedAgentCustomizationPanel = ({ 
  isOpen, 
  onClose,
  initialTab = 'built-in' // 'built-in', 'dynamic', 'templates'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Customization state
  const [customization, setCustomization] = useState({});
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    specialization: '',
    customPrompt: '',
    modelTier: MODEL_TIERS.STANDARD,
    capabilities: [],
    focusAreas: [],
    outputFormat: OUTPUT_FORMATS.STANDARD,
    persona: PERSONA_TYPES.NEUTRAL,
    category: AGENT_CATEGORIES.WRITING,
    userSettings: {
      escalationThreshold: 0.75,
      maxRetries: 2,
      maxTokens: 2000
    }
  });

  // Form state for new agent creation
  const [showAgentCreator, setShowAgentCreator] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [creationStep, setCreationStep] = useState(1); // 1: Template/Custom, 2: Configure, 3: Review

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const allAgents = unifiedAgentCustomizationService.getAllAgents();
      const allTemplates = unifiedAgentCustomizationService.getTemplates();
      
      setAgents(allAgents);
      setTemplates(allTemplates);

      // Auto-select first agent if none selected
      if (!selectedAgent && allAgents.length > 0) {
        selectAgent(allAgents[0]);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectAgent = (agent) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Continue?');
      if (!confirmLeave) return;
    }

    setSelectedAgent(agent);
    setHasUnsavedChanges(false);

    if (agent.type === AGENT_TYPES.BUILT_IN) {
      setCustomization(agent.currentCustomization || {});
    } else {
      setAgentConfig({
        name: agent.name || '',
        description: agent.description || '',
        specialization: agent.specialization || '',
        customPrompt: agent.customPrompt || '',
        modelTier: agent.modelTier || MODEL_TIERS.STANDARD,
        capabilities: agent.capabilities || [],
        focusAreas: agent.focusAreas || [],
        outputFormat: agent.outputFormat || OUTPUT_FORMATS.STANDARD,
        persona: agent.persona || PERSONA_TYPES.NEUTRAL,
        category: agent.category || AGENT_CATEGORIES.WRITING,
        userSettings: agent.userSettings || {
          escalationThreshold: 0.75,
          maxRetries: 2,
          maxTokens: 2000
        }
      });
    }
  };

  const handlePromptCustomizationChange = (elementKey, value) => {
    setCustomization(prev => ({
      ...prev,
      [elementKey]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleAgentConfigChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setAgentConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setAgentConfig(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      setError(null);

      if (selectedAgent.type === AGENT_TYPES.BUILT_IN) {
        await unifiedAgentCustomizationService.customizeBuiltInAgent(
          selectedAgent.id, 
          customization
        );
      } else {
        await unifiedAgentCustomizationService.updateDynamicAgent(
          selectedAgent.id, 
          agentConfig
        );
      }

      setHasUnsavedChanges(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      if (selectedAgent.type === AGENT_TYPES.BUILT_IN) {
        await unifiedAgentCustomizationService.resetBuiltInAgent(selectedAgent.id);
        setCustomization({});
      }
      setHasUnsavedChanges(false);
      await loadData();
    } catch (err) {
      console.error('Failed to reset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (config) => {
    try {
      await unifiedAgentCustomizationService.createDynamicAgent(config);
      setShowAgentCreator(false);
      setCreationStep(1);
      await loadData();
      setActiveTab('dynamic'); // Switch to dynamic tab to show new agent
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(err.message);
    }
  };

  const handleCreateFromTemplate = async (templateKey, customizations = {}) => {
    try {
      await unifiedAgentCustomizationService.createFromTemplate(templateKey, customizations);
      setShowAgentCreator(false);
      setCreationStep(1);
      await loadData();
      setActiveTab('dynamic');
    } catch (err) {
      console.error('Failed to create from template:', err);
      setError(err.message);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;

    try {
      await unifiedAgentCustomizationService.deleteDynamicAgent(agentId);
      if (selectedAgent?.id === agentId) {
        setSelectedAgent(null);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to delete agent:', err);
      setError(err.message);
    }
  };

  const handleCloneAgent = async (agentId) => {
    try {
      await unifiedAgentCustomizationService.cloneDynamicAgent(agentId);
      await loadData();
    } catch (err) {
      console.error('Failed to clone agent:', err);
      setError(err.message);
    }
  };

  // Filter and search logic
  const getFilteredAgents = () => {
    let filtered = agents;

    // Filter by tab
    if (activeTab === 'built-in') {
      filtered = filtered.filter(a => a.type === AGENT_TYPES.BUILT_IN);
    } else if (activeTab === 'dynamic') {
      filtered = filtered.filter(a => a.type === AGENT_TYPES.DYNAMIC);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(a => a.category === filterCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        (a.specialization && a.specialization.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const getFilteredTemplates = () => {
    let filtered = templates;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Agent Customization
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Customize existing agents or create new specialized agents
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {[
              { id: 'built-in', label: 'Built-in Agents', count: agents.filter(a => a.type === AGENT_TYPES.BUILT_IN).length },
              { id: 'dynamic', label: 'My Custom Agents', count: agents.filter(a => a.type === AGENT_TYPES.DYNAMIC).length },
              { id: 'templates', label: 'Templates', count: templates.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar - Agent List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            
            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {Object.values(AGENT_CATEGORIES).map(category => (
                  <option key={category} value={category} className="capitalize">
                    {category}
                  </option>
                ))}
              </select>

              {activeTab === 'dynamic' && (
                <button
                  onClick={() => setShowAgentCreator(true)}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Create New Agent
                </button>
              )}
            </div>

            {/* Agent List */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'templates' ? (
                <TemplateList
                  templates={getFilteredTemplates()}
                  onCreateFromTemplate={handleCreateFromTemplate}
                  loading={loading}
                />
              ) : (
                <AgentList
                  agents={getFilteredAgents()}
                  selectedAgent={selectedAgent}
                  onSelectAgent={selectAgent}
                  onDeleteAgent={handleDeleteAgent}
                  onCloneAgent={handleCloneAgent}
                  loading={loading}
                />
              )}
            </div>
          </div>

          {/* Right Content - Customization Panel */}
          <div className="flex-1 flex flex-col">
            {selectedAgent ? (
              <>
                {/* Agent Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-xl">{selectedAgent.icon || '⚙️'}</span>
                        {selectedAgent.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{selectedAgent.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="capitalize">Type: {selectedAgent.type.replace('_', ' ')}</span>
                        <span className="capitalize">Category: {selectedAgent.category}</span>
                        {selectedAgent.usageCount !== undefined && (
                          <span>Usage: {selectedAgent.usageCount}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUnsavedChanges && (
                        <span className="text-orange-600 text-sm">Unsaved changes</span>
                      )}
                      {selectedAgent.type === AGENT_TYPES.BUILT_IN && (
                        <button
                          onClick={handleReset}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Reset to Default
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customization Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {selectedAgent.customizationLevel === CUSTOMIZATION_LEVELS.PROMPT_ONLY ? (
                    <PromptCustomizationForm
                      agent={selectedAgent}
                      customization={customization}
                      onChange={handlePromptCustomizationChange}
                    />
                  ) : (
                    <FullAgentCustomizationForm
                      agent={selectedAgent}
                      config={agentConfig}
                      onChange={handleAgentConfigChange}
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select an Agent
                  </h3>
                  <p className="text-gray-600">
                    Choose an agent from the list to customize its behavior
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Agent Creator Modal */}
        {showAgentCreator && (
          <AgentCreatorModal
            isOpen={showAgentCreator}
            onClose={() => {
              setShowAgentCreator(false);
              setCreationStep(1);
            }}
            onCreateAgent={handleCreateAgent}
            onCreateFromTemplate={handleCreateFromTemplate}
            templates={templates}
            step={creationStep}
            onStepChange={setCreationStep}
          />
        )}
      </div>
    </div>
  );
};

// Component for listing agents
const AgentList = ({ agents, selectedAgent, onSelectAgent, onDeleteAgent, onCloneAgent, loading }) => {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2 text-sm">Loading agents...</p>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No agents found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {agents.map(agent => (
        <div
          key={agent.id}
          className={`p-4 cursor-pointer hover:bg-gray-50 ${
            selectedAgent?.id === agent.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
          onClick={() => onSelectAgent(agent)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span>{agent.icon || '⚙️'}</span>
                {agent.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{agent.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agent.type === AGENT_TYPES.BUILT_IN 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {agent.type === AGENT_TYPES.BUILT_IN ? 'Built-in' : 'Custom'}
                </span>
                {agent.usageCount !== undefined && (
                  <span className="text-xs text-gray-500">
                    {agent.usageCount} uses
                  </span>
                )}
              </div>
            </div>
            
            {agent.type === AGENT_TYPES.DYNAMIC && (
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloneAgent(agent.id);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 text-sm"
                  title="Clone"
                >
                  📋
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAgent(agent.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 text-sm"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for listing templates
const TemplateList = ({ templates, onCreateFromTemplate, loading }) => {
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2 text-sm">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {templates.map(template => (
        <div key={template.id} className="p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="text-lg">{template.icon}</span>
                {template.name}
              </h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {template.difficulty}
                </span>
                <span className="text-xs text-gray-500 capitalize">{template.category}</span>
              </div>
            </div>
            <button
              onClick={() => onCreateFromTemplate(template.id)}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Use Template
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Component for prompt customization (built-in agents)
const PromptCustomizationForm = ({ agent, customization, onChange }) => {
  if (!agent.customizableElements) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">This agent doesn't have customizable elements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Customize Prompts</h4>
      
      {Object.entries(agent.customizableElements).map(([key, element]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          </label>
          <p className="text-xs text-gray-500 mb-2">{element.description}</p>
          <textarea
            value={customization[key] || element.default}
            onChange={(e) => onChange(key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={element.default}
          />
        </div>
      ))}
    </div>
  );
};

// Component for full agent customization (dynamic agents)
const FullAgentCustomizationForm = ({ agent, config, onChange }) => {
  const addFocusArea = () => {
    onChange('focusAreas', [...config.focusAreas, '']);
  };

  const removeFocusArea = (index) => {
    onChange('focusAreas', config.focusAreas.filter((_, i) => i !== index));
  };

  const updateFocusArea = (index, value) => {
    const newAreas = [...config.focusAreas];
    newAreas[index] = value;
    onChange('focusAreas', newAreas);
  };

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-medium text-gray-900">Agent Configuration</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900">Basic Information</h5>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Name
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={config.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specialization
            </label>
            <input
              type="text"
              value={config.specialization}
              onChange={(e) => onChange('specialization', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900">Configuration</h5>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Tier
            </label>
            <select
              value={config.modelTier}
              onChange={(e) => onChange('modelTier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={MODEL_TIERS.FAST}>Fast (gpt-4o-mini)</option>
              <option value={MODEL_TIERS.STANDARD}>Standard (gpt-4o)</option>
              <option value={MODEL_TIERS.PREMIUM}>Premium (gpt-4)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={config.outputFormat}
              onChange={(e) => onChange('outputFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(OUTPUT_FORMATS).map(format => (
                <option key={format} value={format} className="capitalize">
                  {format.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona
            </label>
            <select
              value={config.persona}
              onChange={(e) => onChange('persona', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(PERSONA_TYPES).map(persona => (
                <option key={persona} value={persona} className="capitalize">
                  {persona}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Focus Areas
        </label>
        <div className="space-y-2">
          {config.focusAreas.map((area, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={area}
                onChange={(e) => updateFocusArea(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Focus area"
              />
              <button
                onClick={() => removeFocusArea(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addFocusArea}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            + Add Focus Area
          </button>
        </div>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Prompt
        </label>
        <textarea
          value={config.customPrompt}
          onChange={(e) => onChange('customPrompt', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="Enter the custom prompt that defines how this agent analyzes content..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {config.customPrompt.length}/2000 characters
        </p>
      </div>
    </div>
  );
};

// Simple Agent Creator Modal placeholder
const AgentCreatorModal = ({ isOpen, onClose, onCreateAgent, onCreateFromTemplate, templates }) => {
  // This would be a simplified version of the existing CustomAgentCreator
  // For now, just a placeholder
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Agent</h3>
        <p className="text-gray-600 mb-4">This would open the agent creation wizard.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedAgentCustomizationPanel;