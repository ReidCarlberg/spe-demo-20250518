import React from 'react';
import { useContext } from 'react';
import { DebugModeContext } from '../../context/DebugModeContext';
import '../../styles/debug-panel.css';

/**
 * A toggle switch component that enables/disables the debug mode
 */
const DebugModeToggle = () => {
  const { isDebugModeActive, toggleDebugMode } = useContext(DebugModeContext);
  
  return (
    <div className="debug-mode-toggle">
      <label htmlFor="debug-toggle" className="debug-toggle-label">
        <span className="debug-toggle-icon">
          <i className="fas fa-search"></i>
        </span>
        <span className="debug-toggle-text">API Explorer</span>
        <div className="debug-toggle-switch">
          <input
            id="debug-toggle"
            type="checkbox"
            checked={isDebugModeActive}
            onChange={toggleDebugMode}
            aria-label="Toggle API explorer mode"
          />
          <span className="debug-toggle-slider"></span>
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
