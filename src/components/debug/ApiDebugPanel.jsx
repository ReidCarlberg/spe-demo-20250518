import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { DebugModeContext } from '../../context/DebugModeContext';
import RequestList from './RequestList';
import RequestDetail from './RequestDetail';
import '../../styles/debug-panel.css';
import { Button } from '@fluentui/react-components';
import { Search24Regular, Dismiss24Regular, Delete24Regular } from '@fluentui/react-icons';

/**
 * Collapsible flyout API Explorer panel that displays API calls from the left side
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
        console.log('Alt+D pressed, toggling API explorer panel');
        setIsPanelVisible(!isPanelVisible);
      }
      // Escape to close panel
      if (e.key === 'Escape' && isPanelVisible) {
        e.preventDefault();
        console.log('Escape pressed, closing API explorer panel');
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

  const [isMobile, setIsMobile] = useState(false);
  const panelRef = useRef(null);
  const touchStartYRef = useRef(0);
  const lastTranslateYRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Drag-to-dismiss handlers for mobile bottom sheet
  useEffect(() => {
    const el = panelRef.current;
    if (!el || !isMobile) return;

    console.log('[ApiDebugPanel] Setting up touch handlers for mobile');

    const onTouchStart = (e) => {
      console.log('[ApiDebugPanel] Touch started at Y:', e.touches[0].clientY);
      touchStartYRef.current = e.touches[0].clientY;
      lastTranslateYRef.current = 0;
      el.style.transition = 'none';
      el.style.willChange = 'transform';
    };

    const onTouchMove = (e) => {
      const delta = e.touches[0].clientY - touchStartYRef.current;
      if (delta > 0) {
        lastTranslateYRef.current = delta;
        el.style.transform = `translateY(${delta}px)`;
        if (delta % 50 < 10) { // Log every ~50px
          console.log('[ApiDebugPanel] Touch moved, delta:', delta);
        }
      }
    };

    const onTouchEnd = () => {
      console.log('[ApiDebugPanel] Touch ended, lastTranslateY:', lastTranslateYRef.current);
      el.style.willChange = 'auto';
      el.style.transition = 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      
      if (lastTranslateYRef.current > 120) {
        // User swiped down past threshold - close the panel
        console.log('[ApiDebugPanel] User swiped past threshold, closing panel');
        el.style.transform = 'translateY(110%)';
        setTimeout(() => {
          setIsPanelVisible(false);
          el.style.transform = '';
          el.style.transition = '';
        }, 250);
      } else {
        // User didn't swipe far enough - snap back to top
        console.log('[ApiDebugPanel] User did not swipe far enough, snapping back');
        el.style.transform = 'translateY(0)';
        setTimeout(() => {
          el.style.transition = '';
        }, 250);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobile, setIsPanelVisible]);

  const handleFilterChange = useCallback((e) => {
    setFilter(e.target.value);
  }, [setFilter]);

  const handleClose = useCallback(() => {
    console.log('API explorer panel close handler called');
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
    console.log('[ApiDebugPanel] Debug mode not active, returning null');
    return null;
  }

  console.log('[ApiDebugPanel] Main render - isPanelVisible =', isPanelVisible, 'isMobile =', isMobile);
  console.log('[ApiDebugPanel] isDebugModeActive =', isDebugModeActive);
  console.log('[ApiDebugPanel] apiCalls count =', apiCalls.length);

  return (
    <>
      {/* Overlay - only when panel is visible */}
      {isPanelVisible && (
        <>
          {console.log('[ApiDebugPanel] Rendering overlay')}
          <div 
            className="api-debug-panel-overlay"
            onClick={handleClose}
          />
        </>
      )}
      
      {/* Flyout Panel - only when panel is visible */}
      {isPanelVisible && (
        <>
          {console.log('[ApiDebugPanel] About to render flyout panel - isMobile =', isMobile)}
          <div 
            ref={panelRef} 
            className={"api-debug-panel-flyout open" + (isMobile ? ' bottom-sheet' : '')}
            onLoad={() => {
              console.log('[ApiDebugPanel] Flyout panel DOM element loaded');
              if (panelRef.current) {
                const rect = panelRef.current.getBoundingClientRect();
                const computed = window.getComputedStyle(panelRef.current);
                console.log('[ApiDebugPanel] Panel rect:', rect);
                console.log('[ApiDebugPanel] Panel computed style - display:', computed.display, 'opacity:', computed.opacity, 'transform:', computed.transform, 'zIndex:', computed.zIndex);
              }
            }}
          >
            <div className="api-debug-panel-header">
              <div className="api-debug-panel-title">
                <i className="fas fa-search"></i>
                <span>API Explorer</span>
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
                <Button 
                  appearance="subtle" 
                  icon={<Delete24Regular />} 
                  onClick={handleClear}
                  aria-label="Clear API calls"
                  className="api-debug-clear-button"
                />
                <Button 
                  appearance="subtle" 
                  icon={<Dismiss24Regular />} 
                  onClick={handleClose}
                  aria-label="Close API explorer panel"
                  className="api-debug-close-button"
                />
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
        </>
      )}

      {/* Toggle Button - only when panel is NOT visible */}
      {!isPanelVisible && (
        <Button 
          appearance="primary"
          onClick={() => setIsPanelVisible(true)}
          aria-label="Open API explorer panel"
          title="Open API Explorer (Alt+D)"
          className="api-debug-panel-toggle"
          icon={<Search24Regular />}
        >
          <span className="api-debug-panel-toggle-text">API Explorer</span>
        </Button>
      )}
    </>
  );
};

export default ApiDebugPanel;
