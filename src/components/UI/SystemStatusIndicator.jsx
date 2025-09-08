/**
 * System Status Indicator for Multi-Agent System
 * Shows system health, active agents, and analysis mode
 */

import React from 'react';

export const SystemStatusIndicator = ({ 
  systemReady, 
  metrics, 
  error, 
  analysisMode, 
  onModeChange 
}) => {
  const getStatusColor = () => {
    if (error) return 'text-red-600 bg-red-50';
    if (!systemReady) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusIcon = () => {
    if (error) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    
    if (!systemReady) {
      return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (error) return 'System Error';
    if (!systemReady) return 'Initializing...';
    return 'Ready';
  };

  const getModeColor = (mode) => {
    const colors = {
      'quick': 'bg-blue-100 text-blue-800',
      'progressive': 'bg-green-100 text-green-800',
      'thorough': 'bg-purple-100 text-purple-800'
    };
    return colors[mode] || 'bg-gray-100 text-gray-800';
  };

  const getModeDescription = (mode) => {
    const descriptions = {
      'quick': 'Fast agents only (1-3s)',
      'progressive': 'Fast then research (1-30s)',
      'thorough': 'Full analysis (15-60s)'
    };
    return descriptions[mode] || mode;
  };

  return (
    <div className="flex items-center space-x-4">
      
      {/* System Status */}
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {getStatusText()}
        </span>
        
        {/* Agent Count */}
        {systemReady && metrics && (
          <span className="text-xs opacity-75">
            ({metrics.orchestrator?.registeredAgents || 0} agents)
          </span>
        )}
      </div>

      {/* Analysis Mode Selector */}
      {systemReady && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Mode:</span>
          <div className="flex items-center space-x-1">
            {['quick', 'progressive', 'thorough'].map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
                  analysisMode === mode
                    ? getModeColor(mode)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={getModeDescription(mode)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {systemReady && metrics && (
        <div className="flex items-center space-x-3 text-xs text-gray-500 border-l border-gray-200 pl-3">
          
          {/* Success Rate */}
          <div className="flex items-center space-x-1">
            <span>Success:</span>
            <span className={`font-medium ${
              (metrics.orchestrator?.successRate || 0) > 0.8 ? 'text-green-600' : 
              (metrics.orchestrator?.successRate || 0) > 0.6 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round((metrics.orchestrator?.successRate || 0) * 100)}%
            </span>
          </div>

          {/* Average Response Time */}
          {metrics.orchestrator?.avgDecisionTime && (
            <div className="flex items-center space-x-1">
              <span>Avg:</span>
              <span className="font-medium">
                {Math.round(metrics.orchestrator.avgDecisionTime)}ms
              </span>
            </div>
          )}

          {/* Cost Efficiency */}
          {metrics.progressiveEnhancement?.enhancementSuccessRate && (
            <div className="flex items-center space-x-1">
              <span>Enhancement:</span>
              <span className="font-medium text-blue-600">
                {Math.round(metrics.progressiveEnhancement.enhancementSuccessRate * 100)}%
              </span>
            </div>
          )}

        </div>
      )}

      {/* Error Details */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded max-w-xs truncate" title={error.message}>
          {error.message}
        </div>
      )}

    </div>
  );
};

export default SystemStatusIndicator;