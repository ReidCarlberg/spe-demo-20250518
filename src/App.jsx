import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { DebugModeProvider } from './context/DebugModeContext'
import { ChatProvider } from './context/ChatContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import PageOne from './pages/PageOne'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SpeExplorePage from './pages/SpeExplorePage'
import FileBrowserPage from './pages/FileBrowserPage'
import ContainerPermissionsPage from './pages/ContainerPermissionsPage'
import PreviewPage from './pages/PreviewPage'
import ListItemsPage from './pages/ListItemsPage'
import SearchPage from './pages/SearchPage'
import AgentPage from './pages/AgentPage'
import Chat from './pages/Chat'
import ProtectedRoute from './components/ProtectedRoute'
import AuthenticationStatus from './components/AuthenticationStatus'
import { ApiDebugPanel, ApiCallNotification } from './components/debug'
import ChatFlyout from './components/ChatFlyout'
import Footer from './components/Footer'

// Add Fluent UI Provider for global theming
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components'
import { speLightTheme, speDarkTheme, getGradientBackground } from './theme/speTheme';

import './App.css'

const ThemedAppShell = () => {
  const { isDarkMode } = useTheme();
  const mode = isDarkMode ? 'dark' : 'light';
  const activeTheme = isDarkMode ? speDarkTheme : speLightTheme;
  return (
    <FluentProvider theme={activeTheme} style={{ minHeight: '100dvh', background: getGradientBackground(mode), transition: 'background .4s ease' }}>
      <Router>
        <AuthenticationStatus />
        <Navbar />
        <ApiDebugPanel />
        <ApiCallNotification />
        <ChatFlyout />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<PageOne />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Navigate to="/spe-explore" replace />} />
            <Route path="/spe-explore" element={<ProtectedRoute><SpeExplorePage /></ProtectedRoute>} />
            <Route path="/file-browser/:containerId/:folderId?" element={<ProtectedRoute><FileBrowserPage /></ProtectedRoute>} />
            <Route path="/container-permissions/:containerId" element={<ProtectedRoute><ContainerPermissionsPage /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/container-permissions" element={<ProtectedRoute><ContainerPermissionsPage /></ProtectedRoute>} />
            <Route path="/preview/:driveId/:itemId" element={<ProtectedRoute><PreviewPage /></ProtectedRoute>} />
            <Route path="/list/:driveId/:folderId?" element={<ProtectedRoute><ListItemsPage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/agent" element={<ProtectedRoute><AgentPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </FluentProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DebugModeProvider>
          <ChatProvider>
            <ThemedAppShell />
       </ChatProvider>
     </DebugModeProvider>
   </ThemeProvider>
     </AuthProvider>
  )
}

export default App;