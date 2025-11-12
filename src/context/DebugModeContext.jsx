import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { setupApiDebugger } from '../utils/serviceWrapper';
import { enableApiDebugging, disableApiDebugging } from '../utils/apiDebugService';

export const DebugModeContext = createContext();

export const DebugModeProvider = ({ children }) => {
  // Reference to the function that removes API interception
  const removeInterceptorRef = useRef(null);

  // Debug mode is always active - no need to toggle it on/off
  // The floating action button provides access to the API Explorer
  const [isDebugModeActive] = useState(true);

  // Store API call history
  const [apiCalls, setApiCalls] = useState([]);

  // Selected API call for details view
  const [selectedCall, setSelectedCall] = useState(null);

  // Panel visibility state
  const [isPanelVisible, setIsPanelVisibilityState] = useState(false);
  
  // Filter options
  const [filter, setFilter] = useState("all"); // "all", "success", "error"

  // Log initial debug mode state
  useEffect(() => {
    console.log('[DebugModeContext] Initialized - API debugging always active');
  }, []);

  // Log whenever isPanelVisible changes
  useEffect(() => {
    console.log('[DebugModeContext] isPanelVisible changed to:', isPanelVisible);
  }, [isPanelVisible]);

  // Add new API call to history
  const captureApiCall = useCallback((callData) => {
    const call = {
      ...callData,
      id: `api-call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    setApiCalls(prev => {
      // Limit history size to 50 items
      const newCalls = [call, ...prev].slice(0, 50);
      return newCalls;
    });

    // If panel is not visible, show a brief notification
    if (!isPanelVisible) {
      const event = new CustomEvent('api-debug-call', { detail: call });
      window.dispatchEvent(event);
    }
  }, [isPanelVisible]);

  // Setup API interception (always active)
  useEffect(() => {
    removeInterceptorRef.current = setupApiDebugger(captureApiCall);
    enableApiDebugging(captureApiCall);

    return () => {
      if (removeInterceptorRef.current) {
        removeInterceptorRef.current();
      }
      disableApiDebugging();
    };
  }, [captureApiCall]);

  // Add keyboard shortcut for toggling debug panel (Alt+D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "d") {
        setIsPanelVisibilityState(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <DebugModeContext.Provider value={{
      isDebugModeActive,
      apiCalls,
      captureApiCall,
      clearApiCalls: useCallback(() => setApiCalls([]), []),
      selectedCall,
      setSelectedCall,
      isPanelVisible,
      setIsPanelVisible: useCallback((visible) => {
        console.log('[DebugModeContext] setIsPanelVisible called with:', visible);
        setIsPanelVisibilityState(visible);
      }, []),
      filter,
      setFilter,
    }}>
      {children}
    </DebugModeContext.Provider>
  );
};
