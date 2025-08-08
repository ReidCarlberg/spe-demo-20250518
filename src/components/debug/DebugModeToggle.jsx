import React, { useContext } from 'react';
import { DebugModeContext } from '../../context/DebugModeContext';
import '../../styles/debug-panel.css';
import { Switch } from '@fluentui/react-components';
import { BeakerEdit24Regular } from '@fluentui/react-icons';

/**
 * A toggle switch component that enables/disables the debug mode
 */
const DebugModeToggle = () => {
  const { isDebugModeActive, toggleDebugMode } = useContext(DebugModeContext);
  
  return (
    <div className="debug-mode-toggle">
      <label htmlFor="debug-toggle" className="debug-toggle-label">
        <span className="debug-toggle-icon">
          <BeakerEdit24Regular />
        </span>
        <span className="debug-toggle-text">API Explorer</span>
        <div className="debug-toggle-switch">
          <Switch 
            id="debug-toggle"
            checked={isDebugModeActive}
            onChange={toggleDebugMode}
          />
        </div>
      </label>
      {isDebugModeActive && (
        <div className="debug-mode-active-indicator">
          <span className="debug-mode-dot"></span>
          <span className="debug-mode-tooltip">
            API Explorer is active. Press Alt+D to toggle flyout panel.
          </span>
        </div>
      )}
    </div>
  );
};

export default DebugModeToggle;
