import React, { useState } from 'react';
import '../styles/floating-chat-button.css';

/**
 * Chat Button Component with loading/error handling
 * Provides visual feedback about the chat's state and retry functionality
 * 
 * @param {Object} props Component props
 * @param {function} props.onClick Callback function when button is clicked
 * @param {boolean} props.isLoading Whether chat is in loading state
 * @param {boolean} props.hasError Whether chat has an error
 */
const ChatButton = ({ onClick, isLoading = false, hasError = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getStateClass = () => {
    if (isLoading) return 'loading';
    if (hasError) return 'error';
    return '';
  };
  
  const getIconClass = () => {
    if (isLoading) return 'fas fa-spinner fa-spin';
    if (hasError) return 'fas fa-exclamation-triangle';
    return 'fas fa-robot';
  };
  
  const getTooltip = () => {
    if (isLoading) return 'Loading chat...';
    if (hasError) return 'Chat failed to load. Click to retry.';
    return 'Chat with AI about this container';
  };
  
  return (
    <button 
      className={`chat-button ${getStateClass()}`}
      onClick={onClick}
      title={getTooltip()}
      aria-label={getTooltip()}
    >
      <i className={getIconClass()}></i>
    </button>
  );
};

export default ChatButton;
