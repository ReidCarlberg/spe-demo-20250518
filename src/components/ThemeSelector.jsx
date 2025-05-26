import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSelector = () => {
  const { currentTheme, changeTheme, getAvailableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const availableThemes = getAvailableThemes();

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <button 
        className="theme-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <i className="fas fa-palette"></i>
        <span className="theme-label">Theme: {currentTheme.name}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} theme-chevron`}></i>
      </button>
      
      {isOpen && (
        <div className="theme-dropdown">
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme.id === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <span className="theme-name">{theme.name}</span>
              {currentTheme.id === theme.id && (
                <i className="fas fa-check theme-check"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
