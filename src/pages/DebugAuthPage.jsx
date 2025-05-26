import React from 'react';
import { useAuth } from '../AuthContext';
import { msalConfig } from '../authConfig';

const DebugAuthPage = () => {
  const { isAuthenticated, user, loading, error, accessToken } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Authentication Debug Information</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current Status:</h3>
        <ul>
          <li><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</li>
          <li><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</li>
          <li><strong>Error:</strong> {error ? error : 'None'}</li>
          <li><strong>User:</strong> {user ? user.username : 'None'}</li>
          <li><strong>Access Token:</strong> {accessToken ? 'Present' : 'None'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>MSAL Configuration:</h3>
        <ul>
          <li><strong>Client ID:</strong> {msalConfig.auth.clientId}</li>
          <li><strong>Authority:</strong> {msalConfig.auth.authority}</li>
          <li><strong>Redirect URI:</strong> {msalConfig.auth.redirectUri}</li>
          <li><strong>Current URL:</strong> {window.location.href}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables:</h3>
        <ul>
          <li><strong>VITE_MSAL_CLIENT_ID:</strong> {import.meta.env.VITE_MSAL_CLIENT_ID || 'Not set'}</li>
          <li><strong>VITE_MSAL_TENANT_ID:</strong> {import.meta.env.VITE_MSAL_TENANT_ID || 'Not set'}</li>
          <li><strong>VITE_CONTAINER_TYPE_ID:</strong> {import.meta.env.VITE_CONTAINER_TYPE_ID || 'Not set'}</li>
        </ul>
      </div>
      
      {user && (
        <div style={{ marginBottom: '20px' }}>
          <h3>User Information:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DebugAuthPage;
