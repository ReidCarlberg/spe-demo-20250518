import React from 'react';
import Layout from '../components/Layout';
import { useSearchParams } from 'react-router-dom';
import SPEChat from '../components/SPEChat';
import { spoConfig } from '../authConfig';
import '../styles/chat-page.css';

const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Retrieve the "containerId" parameter from the URL; default if not provided.
  const containerId = searchParams.get('containerId') || '';
  console.log('Container ID:', containerId);
  console.log('SPO Config:', spoConfig.spHost);
  console.log('SPO Request Scopes:', spoConfig.spoRequest.scopes[0]); 
  
  return (
    <Layout title="Chat">
      <p className="h2">SharePoint Embedded copilot private preview</p>
      <SPEChat 
        containerId={containerId}
        height="calc(100vh - 20vh)"
      />
    </Layout>  );
};

export default Chat;


