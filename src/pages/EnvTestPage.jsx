import React from 'react';

const EnvTestPage = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Vite Environment Variables:</h3>
        <ul>
          <li><strong>VITE_MSAL_CLIENT_ID:</strong> {import.meta.env.VITE_MSAL_CLIENT_ID || 'NOT SET'}</li>
          <li><strong>VITE_MSAL_TENANT_ID:</strong> {import.meta.env.VITE_MSAL_TENANT_ID || 'NOT SET'}</li>
          <li><strong>VITE_CONTAINER_TYPE_ID:</strong> {import.meta.env.VITE_CONTAINER_TYPE_ID || 'NOT SET'}</li>
          <li><strong>VITE_SP_HOST:</strong> {import.meta.env.VITE_SP_HOST || 'NOT SET'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>All Environment Variables:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
          {JSON.stringify(import.meta.env, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Expected values from .env file:</h3>
        <p>If these don't match above, there's an environment loading issue.</p>
        <ul>
          <li>CLIENT_ID should be: bc6c806c-b008-4bb7-bc9c-9e13f56982c6</li>
          <li>TENANT_ID should be: 1f5f7ab1-43d1-4209-aeaf-f9748ede259d</li>
          <li>CONTAINER_TYPE_ID should be: 5336f3ca-8810-40f3-b176-392105f4313f</li>
        </ul>
      </div>
    </div>
  );
};

export default EnvTestPage;
