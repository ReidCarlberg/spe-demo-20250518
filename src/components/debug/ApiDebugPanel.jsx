import React, { useState, useEffect, useContext, useCallback } from 'react';
import { DebugModeContext } from '../../context/DebugModeContext';
import RequestList from './RequestList';
import RequestDetail from './RequestDetail';
import '../../styles/debug-panel.css';

/**
 * Collapsible flyout debug panel that displays API calls from the left side
 */
const ApiDebugPanel = () => {
  const { 
    isDebugModeActive, 
    apiCalls, 
    clearApiCalls,
    isPanelVisible, 
    setIsPanelVisible,
    filter,
    setFilter,
    selectedCall,
    setSelectedCall
  } = useContext(DebugModeContext);

  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+D to toggle panel
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        console.log('Alt+D pressed, toggling panel');
        setIsPanelVisible(!isPanelVisible);
      }
      // Escape to close panel
      if (e.key === 'Escape' && isPanelVisible) {
        e.preventDefault();
        console.log('Escape pressed, closing panel');
        setIsPanelVisible(false);
      }
    };

    if (isDebugModeActive) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDebugModeActive, isPanelVisible, setIsPanelVisible]);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, [setFilter]);

  const handleClose = useCallback(() => {
    console.log('Debug panel close handler called');
    setIsPanelVisible(false);
  }, [setIsPanelVisible]);

  const handleClear = useCallback(() => {
    clearApiCalls();
    setSelectedCall(null);
  }, [clearApiCalls, setSelectedCall]);

  // Apply current filter
  const filteredCalls = filter === 'all' 
    ? apiCalls 
    : filter === 'success'
      ? apiCalls.filter(call => !call.isError)
      : apiCalls.filter(call => call.isError);

  // Don't render if debug mode is not active
  if (!isDebugModeActive) {
    return null;
  }

  return (
    <>
      {/* Overlay - only when panel is visible */}
      {isPanelVisible && (
        <div 
          className="api-debug-panel-overlay"
          onClick={handleClose}
        />
      )}
      
      {/* Flyout Panel - only when panel is visible */}
      {isPanelVisible && (
        <div className="api-debug-panel-flyout open">
          <div className="api-debug-panel-header">
            <div className="api-debug-panel-title">
              <i className="fas fa-bug"></i>
              <span>API Debug</span>
            </div>
            <div className="api-debug-panel-controls">
              <select 
                value={filter} 
                onChange={handleFilterChange}
                className="api-debug-filter"
                aria-label="Filter API calls"
              >
                <option value="all">All Calls</option>
                <option value="success">Success Only</option>
                <option value="error">Errors Only</option>
              </select>
              <button 
                className="api-debug-clear-button" 
                onClick={handleClear}
                aria-label="Clear API calls"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
              <button 
                className="api-debug-close-button" 
                onClick={handleClose}
                aria-label="Close debug panel"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          
          <div className="api-debug-panel-content">
            {apiCalls.length === 0 ? (
              <div className="api-debug-empty">
                <i className="fas fa-info-circle"></i>
                <p>No API calls captured yet</p>
                <p className="api-debug-empty-hint">
                  API calls will appear here when they occur
                </p>
              </div>
            ) : (
              <>
                <div className="api-debug-left-pane">
                  <RequestList 
                    calls={filteredCalls} 
                    selectedCall={selectedCall} 
                    onSelectCall={setSelectedCall} 
                  />
                </div>
                <div className="api-debug-right-pane">
                  <RequestDetail call={selectedCall} />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button - only when panel is NOT visible */}
      {!isPanelVisible && (
        <button 
          className="api-debug-panel-toggle"
          onClick={() => setIsPanelVisible(true)}
          aria-label="Open debug panel"
          title="Open API Debug Panel (Alt+D)"
        >
          <i className="fas fa-bug"></i>
          <span className="api-debug-panel-toggle-text">Debug</span>
        </button>
      )}
    </>
  );
};

export default ApiDebugPanel;
