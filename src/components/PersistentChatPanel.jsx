import React from 'react';
import SPEChat from './SPEChat';
import '../styles/persistent-chat.css';

/**
 * Persistent Chat Panel Component
 * Displays a permanent chat panel on the right side of the screen
 * 
 * @param {Object} props Component props
 * @param {string} props.containerId The container ID for SPE
 * @param {string} props.containerName The name of the container for display
 * @param {boolean} props.collapsed Whether the panel is collapsed (mobile view)
 * @param {function} props.onToggleCollapse Function to toggle collapsed state (mobile)
 * @param {function} props.onError Callback when there's an error with the chat
 */
const PersistentChatPanel = ({ 
  containerId, 
  containerName = 'Container',
  collapsed = false,
  onToggleCollapse,
  onError 
}) => {
  // Handle errors from the chat component
  const handleChatError = () => {
    if (onError && typeof onError === 'function') {
      onError();
    }
  };
  return (
    <div className={`chat-panel ${collapsed ? 'collapsed' : ''}`}>      
      <div className="chat-panel-header">
        <h3 className="chat-panel-title">AI Chat for {containerName}</h3>        <div className="chat-panel-controls">
          {onToggleCollapse && (
            <button 
              className="chat-panel-toggle" 
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand chat panel" : "Collapse chat panel"}
            >
              {collapsed && <span className="collapsed-label">Chat</span>}
              <i className={`fas ${collapsed ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
            </button>
          )}
        </div>
      </div>
      
      <div className="chat-panel-content">
        {containerId ? (
          <SPEChat 
            containerId={containerId}
            height="calc(100vh - 120px)"
            width="100%"
            className="chat-panel-embedded-chat"
          />
        ) : (
          <div className="chat-panel-placeholder">
            <p>No container selected. Please select a container to start chatting.</p>
          </div>
        )}
      </div>
      
      <div className="chat-panel-footer">
        <small>AI-powered chat for your SharePoint Embedded container</small>
      </div>
    </div>
  );
};

export default PersistentChatPanel;
