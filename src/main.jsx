import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance, initializeMsal } from './authService'
import './styles/index.css'
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.css'
import { Button } from '@fluentui/react-components';

// Add a link to the consolidated CSS in the public folder as a backup
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = '/styles/consolidated.css';
document.head.appendChild(linkElement);

// Root element for the app
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

// Show loading state initially
root.render(
  <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <h2>Initializing Application...</h2>
    <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
  </div>
);

// Add loading animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// Initialize MSAL before rendering the app
(async () => {
  try {
    console.log("Starting MSAL initialization...");
    console.log("Environment variables:", {
      CLIENT_ID: import.meta.env.VITE_MSAL_CLIENT_ID,
      TENANT_ID: import.meta.env.VITE_MSAL_TENANT_ID,
      CONTAINER_TYPE_ID: import.meta.env.VITE_CONTAINER_TYPE_ID
    });
    
    // Wait for MSAL to initialize
    await initializeMsal();
    console.log("MSAL initialization complete, rendering app");
    
    // Render the app with initialized MSAL instance
    root.render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error("Error initializing the application:", error);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Render a fallback UI if MSAL fails to initialize
    root.render(
      <div className="auth-error" style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Authentication Error</h2>
        <p>There was a problem initializing the authentication system.</p>
        <p className="error-details">{error.message}</p>
        <details style={{ marginTop: '10px', textAlign: 'left' }}>
          <summary>Technical Details</summary>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px', overflow: 'auto' }}>
            {error.stack}
          </pre>
        </details>
        <Button 
          onClick={() => window.location.reload()} 
          appearance="primary"
          style={{ marginTop: '15px' }}
        >
          Refresh Page
        </Button>
      </div>
    );
  }
})();
