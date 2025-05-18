import React, { useState, useEffect, useRef } from 'react';
import '../styles/chat-flyout.css';
import SPEChat from './SPEChat';


/**
 * Chat Flyout Component
 * Displays a flyout panel from the right side with the SPE Copilot Chat
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the flyout is open
 * @param {function} props.onClose Callback that toggles the chat open/closed state
 * @param {function} props.onError Callback when there's an error with the chat
 * @param {string} props.containerId The container ID for SPE
 * @param {string} props.containerName The name of the container for display
 */
const ChatFlyout = ({ isOpen, onClose, onError, containerId, containerName }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState(false);
  const closeButtonRef = useRef(null);
  const chatAttempts = useRef(0);
  
  // Setup error detection and handling - removed timeout as our component now handles this
  useEffect(() => {
    // Clear any lingering state when the component mounts/unmounts
    return () => {
      // Cleanup function
    };
  }, [isOpen, modalVisible, onError, onClose]);
  
  // Reset chat error state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setChatError(false);
      }, 500);
    }
  }, [isOpen]);
  
  // Handle animation effects when opening/closing
  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      
      // Focus on the close button when modal opens (for accessibility)
      setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, 100);
      
      // Add ESC key handler for closing
      const handleEscKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      // Prevent scrolling of the background
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = '';
      };
    } else {
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 300);
      
      document.body.style.overflow = '';
      
      return () => clearTimeout(timer);
    }  }, [isOpen, onClose]);    // Show restore button even when the flyout is completely hidden

  
  return (
    <>
      <div 
        className={`chat-flyout-overlay ${isOpen ? 'open' : 'closing'}`} 
        onClick={onClose}
        role="complementary"
        aria-labelledby="chat-flyout-title"
      >
        <div className={`chat-flyout-container ${isOpen ? 'open' : 'closing'}`} onClick={(e) => e.stopPropagation()}>
        <div className="chat-flyout-header">
          <h3 id="chat-flyout-title">AI Chat for {containerName || 'Container'}</h3>
          <button 
            className="chat-flyout-close" 
            onClick={onClose} 
            aria-label="Close chat"
            ref={closeButtonRef}
          >
            <i className="fas fa-times"></i>          </button>
        </div>        <div className="chat-flyout-content">
          {containerId && (
            <>
              <SPEChat 
                containerId={containerId}
                height="calc(100vh - 150px)"
                width="100%"
                className="chat-flyout-embedded-chat"
              />
              <div className="chat-flyout-footer">
                <small>If the chat doesn't load, try refreshing the page or checking your connection.</small>
              </div>
            </>
          )}        </div>
      </div>
    </div>
    </>
  );
};

export default ChatFlyout;
