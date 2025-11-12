import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useChatFlyout } from '../hooks/useChatFlyout';
import SPEChat from './SPEChat';
import '../styles/chat-flyout.css';
import { Button } from '@fluentui/react-components';
import { Dismiss24Regular, Bot24Regular } from '@fluentui/react-icons';

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

  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef(null);
  const touchStartYRef = useRef(0);
  const lastTranslateYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  
  
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

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handlers for drag-to-dismiss on mobile
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile) return;

    const onTouchStart = (e) => {
      touchStartYRef.current = e.touches[0].clientY;
      lastTranslateYRef.current = 0;
      el.style.transition = 'none';
    };

    const onTouchMove = (e) => {
      const delta = e.touches[0].clientY - touchStartYRef.current;
      if (delta > 0) {
        lastTranslateYRef.current = delta;
        setTranslateY(delta);
        el.style.transform = `translateY(${delta}px)`;
      }
    };

    const onTouchEnd = () => {
      el.style.transition = '';
      if (lastTranslateYRef.current > 120) {
        setIsChatVisible(false);
        setTranslateY(0);
        el.style.transform = '';
      } else {
        // snap back
        el.style.transform = '';
        setTranslateY(0);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [isMobile, setIsChatVisible]);

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
        <div ref={containerRef} className={"chat-flyout-container open" + (isMobile ? ' bottom-sheet' : '')}>
          <div className="chat-flyout-header">
            <div className="chat-flyout-title">
              <i className="fas fa-robot"></i>
              <span>AI Chat for {currentContainer.name || 'Container'}</span>
            </div>
            <Button 
              appearance="subtle" 
              icon={<Dismiss24Regular />} 
              onClick={handleClose}
              aria-label="Close chat flyout"
              className="chat-flyout-close-button"
            />
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
        <Button 
          appearance="primary"
          onClick={() => setIsChatVisible(true)}
          aria-label="Open chat flyout"
          title="Open Chat (Alt+C)"
          className="chat-flyout-toggle"
          icon={<Bot24Regular />}
        >
          <span className="chat-flyout-toggle-text">Chat</span>
        </Button>
      )}
    </>
  );
};

export default ChatFlyout;
