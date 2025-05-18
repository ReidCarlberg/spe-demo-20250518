import React, { useEffect, useState } from 'react';
// Import with error handling
let ChatEmbedded = null;
let ChatEmbeddedAPI = null;

// Safely try to import the components
try {
  const chatModule = require('@microsoft/sharepointembedded-copilotchat-react');
  ChatEmbedded = chatModule.ChatEmbedded;
  ChatEmbeddedAPI = chatModule.ChatEmbeddedAPI;
} catch (error) {
  console.error('Failed to import SharePoint Embedded Copilot Chat:', error);
}

import { requestSPOAccessToken } from '../authService';
import { spoConfig } from '../authConfig';
import '../styles/chat.css';

/**
 * SharePoint Embedded Copilot Chat Component
 * This component renders the SharePoint Embedded AI chat bot
 * 
 * @param {Object} props Component props
 * @param {string} props.containerId The ID of the current container/drive
 * @param {string} props.containerDisplayName Optional display name for the container
 */
const SPECopilotChat = ({ containerId, containerDisplayName }) => {
  const [chatApi, setChatApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadTimeout, setLoadTimeout] = useState(false);

  // Create the auth provider object for the chat component
  const authProvider = {
    hostname: spoConfig.spHost || '',
    getToken: async () => {
      try {
        const token = await requestSPOAccessToken();
        if (!token) {
          throw new Error('Failed to acquire SPO token');
        }
        return token;
      } catch (error) {
        console.error('Error getting SPO token:', error);
        setError(`Authentication error: ${error.message}`);
        throw error;
      }
    }
  };  // Set loading timeout to prevent indefinite loading state
  useEffect(() => {
    let timeoutId = null;
    
    if (isLoading && !chatApi) {
      timeoutId = setTimeout(() => {
        console.warn('Chat loading timeout exceeded');
        setError('Chat component failed to load. Please try again or refresh the page.');
        setIsLoading(false);
      }, 15000); // 15 second timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, chatApi]);

  // Open chat when chatApi is ready
  useEffect(() => {
    const initializeChat = async () => {
      if (chatApi) {
        try {
          setIsLoading(true);
          await chatApi.openChat();
          setError(null);
        } catch (error) {
          console.error('Error opening chat:', error);
          setError(`Error opening chat: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initializeChat();
  }, [chatApi]);

  // Handle retry for API errors
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    // The API will be re-initialized when the component re-renders
  };
  if (isLoading && !chatApi) {
    return (
      <div className="chat-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading AI assistant...</p>
        <p className="chat-loading-subtitle">This may take a moment</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="chat-error">
        <i className="fas fa-exclamation-triangle"></i>
        <p>Error: {error}</p>
        <button className="chat-retry-button" onClick={handleRetry}>
          Retry
        </button>
        <p className="chat-error-tip">
          If this persists, try refreshing the page or checking your connection.
        </p>
      </div>
    );
  }

  // Display a fallback UI if ChatEmbedded isn't available
  if (!ChatEmbedded) {
    return (
      <div className="spe-chat-container">
        <h3>Chat with your data in {containerDisplayName || 'this container'}</h3>
        <div className="chat-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>The SharePoint Embedded Copilot Chat component could not be loaded.</p>
          <p>Check your dependencies and imports.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="spe-chat-container">
      <h3>Chat with your data in {containerDisplayName || 'this container'}</h3>
      <ChatEmbedded
        authProvider={authProvider}
        onApiReady={(api) => {
          setChatApi(api);
        }}
        containerId={containerId}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '500px',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default SPECopilotChat;


