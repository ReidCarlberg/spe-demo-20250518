import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '@fluentui/react-components';
import { Color24Regular, ChevronDown24Regular, ChevronUp24Regular, Checkmark24Regular, WeatherMoon24Regular, WeatherSunny24Regular } from '@fluentui/react-icons';

const ThemeSelector = () => {
  const { currentTheme, changeTheme, getAvailableThemes, isDarkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const availableThemes = getAvailableThemes();

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="theme-selector">
      <div style={{ display: 'flex', gap: 8 }}>
        <Button 
          appearance="secondary"
          className="theme-selector-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Change theme"
          icon={<Color24Regular />}
        >
          <span className="theme-label">Theme: {currentTheme.name}</span>
          {isOpen ? <ChevronUp24Regular className="theme-chevron" /> : <ChevronDown24Regular className="theme-chevron" />}
        </Button>
        <Button 
          appearance="secondary"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
          icon={isDarkMode ? <WeatherSunny24Regular /> : <WeatherMoon24Regular />}
        >
          {isDarkMode ? 'Light' : 'Dark'}
        </Button>
      </div>
      
      {isOpen && (
        <div className="theme-dropdown">
          {availableThemes.map((theme) => (
            <Button
              key={theme.id}
              appearance={currentTheme.id === theme.id ? 'primary' : 'secondary'}
              className={`theme-option ${currentTheme.id === theme.id ? 'active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
              icon={currentTheme.id === theme.id ? <Checkmark24Regular /> : undefined}
            >
              <span className="theme-name">{theme.name}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
