import React, { useEffect, useCallback } from 'react';
import { useChatFlyout } from '../hooks/useChatFlyout';
import SPEChat from './SPEChat';
import '../styles/chat-flyout.css';

/**
 * Chat Flyout Component
 * Displays a collapsible flyout panel from the right side with the SPE Copilot Chat
 * Works exactly like the DevMode flyout with conditional rendering
 */
const ChatFlyout = () => {
  const { 
    isChatVisible, 
    setIsChatVisible,
    currentContainer
  } = useChatFlyout();
  
  
  // Handle keyboard shortcuts (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close flyout
      if (e.key === 'Escape' && isChatVisible) {
        e.preventDefault();
        console.log('Escape pressed, closing chat flyout');
        setIsChatVisible(false);
      }
    };

    if (currentContainer.id) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatVisible, currentContainer.id, setIsChatVisible]);

  const handleClose = useCallback(() => {
    console.log('Chat flyout close handler called');
    setIsChatVisible(false);
  }, [setIsChatVisible]);

  // Handle overlay click to close
  const handleOverlayClick = useCallback(() => {
    setIsChatVisible(false);
  }, [setIsChatVisible]);

  // Don't render if no container is set
  if (!currentContainer.id) {
    return null;
  }

  return (
    <>
      {/* Overlay - only when flyout is visible */}
      {isChatVisible && (
        <div 
          className="chat-flyout-overlay"
          onClick={handleOverlayClick}
        />
      )}
      
      {/* Flyout Panel - only when flyout is visible */}
      {isChatVisible && (
        <div className="chat-flyout-container open">
          <div className="chat-flyout-header">
            <div className="chat-flyout-title">
              <i className="fas fa-robot"></i>
              <span>AI Chat for {currentContainer.name || 'Container'}</span>
            </div>
            <button 
              className="chat-flyout-close-button" 
              onClick={handleClose}
              aria-label="Close chat flyout"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="chat-flyout-content">
            <SPEChat 
              containerId={currentContainer.id}
              height="calc(100vh - 120px)"
              width="100%"
              className="chat-flyout-embedded-chat"
            />
            <div className="chat-flyout-footer">
              <small>AI-powered chat for your SharePoint Embedded container</small>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - only when flyout is NOT visible */}
      {!isChatVisible && (
        <button 
          className="chat-flyout-toggle"
          onClick={() => setIsChatVisible(true)}
          aria-label="Open chat flyout"
          title="Open Chat (Alt+C)"
        >
          <i className="fas fa-robot"></i>
          <span className="chat-flyout-toggle-text">Chat</span>
        </button>
      )}
    </>
  );
};

export default ChatFlyout;
