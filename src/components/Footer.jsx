import React from 'react';
import DebugModeToggle from './debug/DebugModeToggle';
import ThemeSelector from './ThemeSelector';
import '../styles/footer.css';

/**
 * Common footer component that appears on all pages
 * Contains links and the API Explorer toggle
 */
const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a 
            href="https://aka.ms/start-spe" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            <i className="fas fa-external-link-alt"></i>
            Learn more about SharePoint Embedded
          </a>
        </div>
        
        <div className="footer-controls">
          <ThemeSelector />
          <DebugModeToggle />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
