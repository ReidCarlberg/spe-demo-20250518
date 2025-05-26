import { createContext, useState, useEffect, useCallback } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // Chat flyout visibility state
  const [isChatVisible, setIsChatVisible] = useState(false);
  
  // Current container info for chat
  const [currentContainer, setCurrentContainer] = useState({
    id: null,
    name: null
  });

  // Add keyboard shortcut for toggling chat flyout
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + C to toggle chat flyout
      if (e.altKey && e.key === "c" && currentContainer.id) {
        e.preventDefault();
        console.log('Alt+C pressed, toggling chat flyout');
        setIsChatVisible(prev => !prev);
      }
      // Escape to close chat flyout
      if (e.key === 'Escape' && isChatVisible) {
        e.preventDefault();
        console.log('Escape pressed, closing chat flyout');
        setIsChatVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChatVisible, currentContainer.id]);

  // Toggle chat flyout visibility
  const toggleChatFlyout = useCallback(() => {
    setIsChatVisible(prev => !prev);
  }, []);

  // Set current container for chat
  const setContainer = useCallback((id, name) => {
    console.log('ChatContext.setContainer called:', { id, name });
    setCurrentContainer({ id, name });
  }, []);

  // Clear container (hide flyout)
  const clearContainer = useCallback(() => {
    setCurrentContainer({ id: null, name: null });
    setIsChatVisible(false);
  }, []);

  return (
    <ChatContext.Provider value={{
      isChatVisible,
      setIsChatVisible,
      toggleChatFlyout,
      currentContainer,
      setContainer,
      clearContainer,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
