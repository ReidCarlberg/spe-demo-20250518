import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from './authService'
import './styles/index.css'
import App from './App.jsx'
import '@fortawesome/fontawesome-free/css/all.css'

// Add a link to the consolidated CSS in the public folder as a backup
const linkElement = document.createElement('link');
linkElement.rel = 'stylesheet';
linkElement.href = '/styles/consolidated.css';
document.head.appendChild(linkElement);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>,
)
