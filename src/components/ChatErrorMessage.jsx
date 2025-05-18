import React from 'react';

/**
 * Chat Error Message Component
 * Displays an error message when SPE chat fails to load
 */
const ChatErrorMessage = ({ onRetry, error }) => {
  return (
    <div className="chat-error-container">
      <div className="chat-error-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h3 className="chat-error-title">Chat Failed to Load</h3>
      <p className="chat-error-message">
        {error || "The chat component couldn't be loaded. This could be due to a network issue or an authentication problem."}
      </p>
      <div className="chat-error-actions">
        <button className="chat-error-retry-btn" onClick={onRetry}>
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
        <button className="chat-error-help-btn" onClick={() => window.open('https://aka.ms/specopilotchat', '_blank')}>
          <i className="fas fa-question-circle"></i> Get Help
        </button>
      </div>
      <div className="chat-error-tips">
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Check your internet connection</li>
          <li>Try refreshing the page</li>
          <li>Make sure you're logged in properly</li>
          <li>Check if you have access to this container</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatErrorMessage;
