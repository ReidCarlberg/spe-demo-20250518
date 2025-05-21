import React, { useState, useEffect } from 'react';
import { useDebugMode } from '../../hooks/useDebugMode';
import '../../styles/debug-panel.css';

/**
 * Shows a brief notification when an API call happens while the debug panel is hidden
 */
const ApiCallNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastCall, setLastCall] = useState(null);
  const { setIsPanelVisible } = useDebugMode();
  
  useEffect(() => {
    // Listen for API call events
    const handleApiCall = (event) => {
      const call = event.detail;
      
      setLastCall(call);
      setIsVisible(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };
    
    window.addEventListener('api-debug-call', handleApiCall);
    
    return () => {
      window.removeEventListener('api-debug-call', handleApiCall);
    };
  }, []);
  
  if (!isVisible || !lastCall) return null;
  
  // Format the URL for display
  const getDisplayUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || urlObj.pathname;
    } catch (e) {
      return url.slice(-15);
    }
  };
  
  // Get status class based on success/error
  const getStatusClass = () => {
    return lastCall.isError ? 'error' : 'success';
  };
  
  // Handle click to open the debug panel
  const handleClick = () => {
    setIsPanelVisible(true);
    setIsVisible(false);
  };
  
  return (
    <div 
      className={`api-call-notification ${getStatusClass()}`}
      onClick={handleClick}
    >
      <div className="api-call-notification-icon">
        <i className={`fas ${lastCall.isError ? 'fa-exclamation-circle' : 'fa-check-circle'}`}></i>
      </div>
      <div className="api-call-notification-content">
        <div className="api-call-notification-title">
          {lastCall.method} {getDisplayUrl(lastCall.url)}
        </div>
        <div className="api-call-notification-status">
          {lastCall.isError 
            ? `Error: ${lastCall.error || 'Request failed'}` 
            : `Status: ${lastCall.status || 'Pending'}`}
        </div>
      </div>
    </div>
  );
};

export default ApiCallNotification;