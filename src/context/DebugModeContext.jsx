import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { setupApiDebugger } from '../utils/serviceWrapper';
import { enableApiDebugging, disableApiDebugging } from '../utils/apiDebugService';

export const DebugModeContext = createContext();

export const DebugModeProvider = ({ children }) => {
  // Reference to the function that removes API interception
  const removeInterceptorRef = useRef(null);

  // Initialize from localStorage if available
  const [isDebugModeActive, setIsDebugModeActive] = useState(() => {
    return localStorage.getItem("debug_mode") === "true";
  });

  // Store API call history
  const [apiCalls, setApiCalls] = useState([]);

  // Selected API call for details view
  const [selectedCall, setSelectedCall] = useState(null);

  // Panel visibility state
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  // Log initial debug mode state
  useEffect(() => {
    console.log('[DebugModeContext] Initialized with isDebugModeActive =', isDebugModeActive, 'isPanelVisible =', isPanelVisible);
  }, []);

  // Log whenever isPanelVisible changes
  useEffect(() => {
    console.log('[DebugModeContext] isPanelVisible changed to:', isPanelVisible);
  }, [isPanelVisible]);

  // Filter options
  const [filter, setFilter] = useState("all"); // "all", "success", "error"

  // Add new API call to history (move this above useEffect!)
  const captureApiCall = useCallback((callData) => {
    if (!isDebugModeActive) return;

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
  }, [isDebugModeActive, isPanelVisible]);

  // Update localStorage and manage API interception when debug mode changes
  useEffect(() => {
    localStorage.setItem("debug_mode", isDebugModeActive);

    // Setup or remove API interception based on debug mode state
    if (isDebugModeActive) {
      // Setup API interception
      removeInterceptorRef.current = setupApiDebugger(captureApiCall);

      // Enable enhanced service debugging
      enableApiDebugging(captureApiCall);
    } else {
      // Remove API interception if it was set up
      if (removeInterceptorRef.current) {
        removeInterceptorRef.current();
        removeInterceptorRef.current = null;
      }

      // Disable enhanced service debugging
      disableApiDebugging();

      // Clear history when disabled to free memory
      setApiCalls([]);
      // Hide panel when debug mode is disabled
      setIsPanelVisible(false);
    }

    // Cleanup when component unmounts
    return () => {
      if (removeInterceptorRef.current) {
        removeInterceptorRef.current();
      }
      disableApiDebugging();
    };
  }, [isDebugModeActive, captureApiCall]);

  // Add keyboard shortcut for toggling debug panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + D to toggle debug panel
      if (e.altKey && e.key === "d" && isDebugModeActive) {
        setIsPanelVisible(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDebugModeActive, setIsPanelVisible]);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setIsDebugModeActive(prev => !prev);
  }, []);

  return (
    <DebugModeContext.Provider value={{
      isDebugModeActive,
      toggleDebugMode,
      apiCalls,
      captureApiCall,
      clearApiCalls: useCallback(() => setApiCalls([]), []),
      selectedCall,
      setSelectedCall,
      isPanelVisible,
      setIsPanelVisible: useCallback((visible) => {
        console.log('[DebugModeContext] setIsPanelVisible called with:', visible);
        console.log('[DebugModeContext] Current state - isDebugModeActive:', isDebugModeActive, 'isPanelVisible (before):', isPanelVisible);
        console.log('[DebugModeContext] Stack trace:', new Error().stack);
        setIsPanelVisible(visible);
      }, [isDebugModeActive, isPanelVisible]),
      filter,
      setFilter,
    }}>
      {children}
    </DebugModeContext.Provider>
  );
};
