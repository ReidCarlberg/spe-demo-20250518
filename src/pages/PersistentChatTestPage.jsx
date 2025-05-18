import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PersistentChatPanel from '../components/PersistentChatPanel';
import SPEChat from '../components/SPEChat';
import './ChatTestPage.css';
import '../styles/chat-page.css';
import '../styles/persistent-chat.css';

const PersistentChatTestPage = () => {
  const [chatError, setChatError] = useState(false);
  const [containerId, setContainerId] = useState('');
  const [isChatCollapsed, setIsChatCollapsed] = useState(window.innerWidth <= 768);
  const [isChatClosed, setIsChatClosed] = useState(false);
  
  // Handle responsive chat panel
  useEffect(() => {
    const handleResize = () => {
      setIsChatCollapsed(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleChatCollapsed = () => {
    setIsChatCollapsed(prev => !prev);
  };
  
  const toggleChatClosed = () => {
    setIsChatClosed(prev => !prev);
  };
  
  const handleChatError = () => {
    setChatError(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('containerId');
    setContainerId(id);
  };
    return (
    <Layout title="Persistent Chat Test">
      <div className={`chat-test-wrapper ${containerId ? 'with-chat-panel' : ''} ${isChatCollapsed ? 'panel-collapsed' : ''} ${isChatClosed ? 'chat-closed' : ''}`}>
        <div className="chat-test-container">
          <section className="chat-test-intro">
            <h2>Persistent Chat Panel Test</h2>
            <p>
              This page demonstrates the persistent chat panel that stays visible on the right side of the screen.
              The chat is always accessible without needing to click a button to open it.
            </p>
            
            {!containerId ? (
              <form onSubmit={handleSubmit} className="container-id-form">
                <div className="form-group">
                  <label htmlFor="containerId">Enter Container ID to test:</label>
                  <input 
                    type="text" 
                    id="containerId" 
                    name="containerId" 
                    placeholder="Enter a valid container ID"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">Set Container ID</button>
              </form>
            ) : (
              <div className="chat-controls">
                <p>Container ID: <strong>{containerId}</strong></p>
                  <button 
                  className="chat-button"
                  onClick={toggleChatCollapsed}
                >
                  <i className="fas fa-columns"></i>
                  <span>{isChatCollapsed ? 'Expand Chat Panel' : 'Collapse Chat Panel'}</span>
                </button>
                
                <button 
                  className="chat-button close-button"
                  onClick={toggleChatClosed}
                >
                  <i className="fas fa-times"></i>
                  <span>{isChatClosed ? 'Open Chat Panel' : 'Close Chat Panel'}</span>
                </button>
                
                <button 
                  className="reset-button"
                  onClick={() => {
                    setContainerId('');
                    setChatError(false);
                    setIsChatClosed(false);
                  }}
                >
                  Reset Container ID
                </button>
              </div>
            )}
          </section>
          
          <section className="layout-demo">
            <h3>Page Layout with Persistent Chat</h3>
            <p>Notice how the main content adjusts to make room for the chat panel:</p>
            
            <div className="content-blocks">
              {Array(6).fill(0).map((_, index) => (
                <div key={index} className="content-block">
                  <h4>Content Block {index + 1}</h4>
                  <p>This is a sample content block to demonstrate how the layout works with a persistent chat panel.</p>
                </div>
              ))}
            </div>
          </section>
          
          <section className="responsive-info">
            <h3>Responsive Behavior</h3>
            <p>On mobile devices, the chat panel will automatically collapse to the side. You can expand it by clicking the toggle button.</p>
            <p>Try resizing your browser window to see how the layout adapts.</p>
          </section>
        </div>
          {/* Persistent Chat Panel */}
        {containerId && (
          <PersistentChatPanel
            containerId={containerId}
            containerName="Test Container"
            collapsed={isChatCollapsed}
            closed={isChatClosed}
            onToggleCollapse={toggleChatCollapsed}
            onToggleClose={toggleChatClosed}
            onError={handleChatError}
          />
        )}
      </div>
    </Layout>
  );
};

export default PersistentChatTestPage;
