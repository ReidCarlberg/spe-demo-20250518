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
  
  // Panel position
  const [panelPosition, setPanelPosition] = useState(() => {
    const savedPosition = localStorage.getItem("debug_panel_position");
    return savedPosition ? JSON.parse(savedPosition) : { x: 10, y: 10 };
  });
  
  // Panel size
  const [panelSize, setPanelSize] = useState(() => {
    const savedSize = localStorage.getItem("debug_panel_size");
    return savedSize ? JSON.parse(savedSize) : { width: 400, height: 500 };
  });

  // Filter options
  const [filter, setFilter] = useState("all"); // "all", "success", "error"
  
  // Update localStorage and manage API interception when debug mode changes
  useEffect(() => {
    localStorage.setItem("debug_mode", isDebugModeActive);
    
    // Show panel when debug mode is activated
    if (isDebugModeActive && apiCalls.length === 0) {
      setIsPanelVisible(true);
    }
    
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
      setIsPanelVisible(false);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (removeInterceptorRef.current) {
        removeInterceptorRef.current();
      }
      disableApiDebugging();
    };
  }, [isDebugModeActive, captureApiCall, apiCalls.length, setIsPanelVisible, setApiCalls]);
  
  // Save panel position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("debug_panel_position", JSON.stringify(panelPosition));
  }, [panelPosition]);
  
  // Save panel size to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("debug_panel_size", JSON.stringify(panelSize));
  }, [panelSize]);
  
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
  
  // Add new API call to history
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
      setIsPanelVisible,
      panelPosition,
      setPanelPosition,
      panelSize,
      setPanelSize,
      filter,
      setFilter,
    }}>
      {children}
    </DebugModeContext.Provider>
  );
};
