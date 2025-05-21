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
          <i className="fas fa-bug"></i>
        </span>
        <span className="debug-toggle-text">Developer Mode</span>
        <div className="debug-toggle-switch">
          <input
            id="debug-toggle"
            type="checkbox"
            checked={isDebugModeActive}
            onChange={toggleDebugMode}
            aria-label="Toggle developer mode"
          />
          <span className="debug-toggle-slider"></span>
        </div>
      </label>
      {isDebugModeActive && (
        <div className="debug-mode-active-indicator">
          <span className="debug-mode-dot"></span>
          <span className="debug-mode-tooltip">
            Developer Mode is active. Press Alt+D to toggle panel.
          </span>
        </div>
      )}
    </div>
  );
};

export default DebugModeToggle;
