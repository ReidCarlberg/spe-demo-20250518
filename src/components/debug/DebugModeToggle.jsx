import React, { useContext } from 'react';
import { DebugModeContext } from '../../context/DebugModeContext';
import '../../styles/debug-panel.css';

/**
 * Debug mode indicator component
 * Note: Debug mode is always active. The API Explorer is always available via the floating action button.
 * This component can be used to display that the API Explorer is active if needed.
 */
const DebugModeToggle = () => {
  const { isDebugModeActive } = useContext(DebugModeContext);
  
  // Debug mode is always active, so we can just show a status indicator if needed
  // Currently not used in the navbar, but keeping for backward compatibility
  if (!isDebugModeActive) {
    return null;
  }

  return null; // Not rendering anything - debug mode is always active
};

export default DebugModeToggle;
