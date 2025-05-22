import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DebugModeContext } from '../../context/DebugModeContext';
import RequestList from './RequestList';
import RequestDetail from './RequestDetail';
import '../../styles/debug-panel.css';

/**
 * Draggable, resizable debug panel that displays API calls
 */
const ApiDebugPanel = () => {
  const { 
    isDebugModeActive, 
    apiCalls, 
    clearApiCalls,
    isPanelVisible, 
    setIsPanelVisible,
    panelPosition,
    setPanelPosition,
    panelSize,
    setPanelSize,
    filter,
    setFilter,
    selectedCall,
    setSelectedCall
  } = useContext(DebugModeContext);
  
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    // Create a portal for the debug panel
  const [portalContainer, setPortalContainer] = useState(null);
  
  // Initialize portal container
  useEffect(() => {
    const container = document.createElement('div');
    container.id = 'debug-panel-portal';
    document.body.appendChild(container);
    setPortalContainer(container);
    
    return () => {
      // Only try to remove if it's still a child of the body
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    };
  }, []);
  
  // Don't render anything if debug mode is not active or panel is not visible
  if (!isDebugModeActive || !isPanelVisible || !portalContainer) {
    return null;
  }
  // Start dragging
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [setIsDragging, setDragOffset]);
  // Define event handlers with useCallback to prevent recreating on every render
  const handleDrag = useCallback((e) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };
    
    // Constrain to viewport
    newPosition.x = Math.max(0, Math.min(newPosition.x, window.innerWidth - panelSize.width));
    newPosition.y = Math.max(0, Math.min(newPosition.y, window.innerHeight - panelSize.height));
    
    setPanelPosition(newPosition);
  }, [isDragging, dragOffset, panelSize.width, panelSize.height, setPanelPosition]);
    // Stop dragging
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);
  // Start resizing
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: panelSize.width,
      height: panelSize.height
    });
  }, [setIsResizing, panelSize.width, panelSize.height]);
    // Handle resizing
  const handleResize = useCallback((e) => {
    if (!isResizing) return;
    
    const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
    const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
    
    setPanelSize({
      width: newWidth,
      height: newHeight
    });
  }, [isResizing, resizeStart, setPanelSize]);
    // Stop resizing
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);
  
  // Setup global event listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isDragging, isResizing, handleDrag, handleDragEnd, handleResize, handleResizeEnd]);
  // Handle filter change
  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, [setFilter]);
    // Close the panel
  const handleClose = useCallback(() => {
    setIsPanelVisible(false);
  }, [setIsPanelVisible]);
    // Clear all API calls
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
  
  return createPortal(
    <div 
      className="api-debug-panel"
      ref={panelRef}
      style={{
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
      }}
    >
      <div 
        className="api-debug-panel-header" 
        ref={dragRef}
        onMouseDown={handleDragStart}
      >
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
      
      <div 
        className="api-debug-panel-resize-handle" 
        ref={resizeRef}
        onMouseDown={handleResizeStart}
      >
        <i className="fas fa-grip-lines-vertical"></i>
      </div>
    </div>,
    portalContainer
  );
};

export default ApiDebugPanel;
