import React, { useEffect, useState } from 'react';
import { ChatEmbedded, ChatEmbeddedAPI, IChatEmbeddedApiAuthProvider } from '@microsoft/sharepointembedded-copilotchat-react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { spoConfig } from '../authConfig';
import '../styles/chat-page.css';
import '../styles/spe-chat.css';

interface SPEChatProps {
  containerId: string;
  width?: string;
  height?: string;
  className?: string;
}

const SPEChat: React.FC<SPEChatProps> = ({ 
  containerId, 
  width = 'calc(100% - 4px)', 
  height = 'calc(100vh - 20vh)', 
  className = '' 
}) => {
  const { instance, accounts } = useMsal();
  const [chatApi, setChatApi] = useState<ChatEmbeddedAPI | null>(null);
  
  // Log container ID for debugging
  useEffect(() => {
    if (containerId === '') {
      console.warn('SPEChat: Empty string container ID provided');
    } else if (!containerId) {
      console.warn('SPEChat: Null or undefined container ID');
    } else {
      console.log('SPEChat: Container ID:', containerId);
    }
  }, [containerId]);
  
  // Define the authProvider object using the interface and environment variable for hostname
  const authProvider: IChatEmbeddedApiAuthProvider = {
    hostname: spoConfig.spHost,
    getToken: requestSPOAccessToken,
  };

  async function requestSPOAccessToken(): Promise<string> {
    const containerScopes = {
      scopes: [spoConfig.spoRequest.scopes[0]],
      redirectUri: spoConfig.spoRequest.redirectUri
    };

    let containerTokenResponse;
    try {
      containerTokenResponse = await instance.acquireTokenSilent({
        ...containerScopes,
        account: accounts[0],
      });
      return containerTokenResponse.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        containerTokenResponse = await instance.acquireTokenPopup({
          ...containerScopes,
          account: accounts[0],
        });
        return containerTokenResponse.accessToken;
      } else {
        console.error("Error acquiring token:", error);
        throw new Error("Could not acquire token");
      }
    }
  }
  // Open chat once chatApi is ready
  useEffect(() => {
    const initializeChat = async () => {
      if (chatApi) {
        try {
          await chatApi.openChat();
        } catch (error) {
          console.error('Error opening chat:', error);
        }
      }
    };
    initializeChat();
  }, [chatApi]);
  // Check for empty string containerId specifically
  if (containerId === '') {
    return (
      <div className="alert alert-empty-container">
        <p>
          <strong>Empty container ID detected!</strong> The containerId is an empty string. 
          Please provide a valid container ID to enable the chat functionality.
        </p>
      </div>
    );
  }

  // Check for null or undefined containerId
  if (!containerId) {
    return (
      <div className="alert alert-warning">
        <p>No container ID provided. Please provide a valid container ID.</p>
      </div>
    );
  }

  return (
    <div className={`spe-chat-container ${className}`} id={containerId}>
      <ChatEmbedded
        authProvider={authProvider}
        onApiReady={(api: ChatEmbeddedAPI) => {
          setChatApi(api);
        }}
        containerId={containerId}
        style={{ width, height }}
      />
    </div>
  );
};

export default SPEChat;
