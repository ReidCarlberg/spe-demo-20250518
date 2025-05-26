import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { DebugModeProvider } from './context/DebugModeContext'
import { ChatProvider } from './context/ChatContext'
import Navbar from './components/Navbar'
import PageOne from './pages/PageOne'
import PageTwo from './pages/PageTwo'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SpeExplorePage from './pages/SpeExplorePage'
import FileBrowserPage from './pages/FileBrowserPage'
import ContainerPermissionsPage from './pages/ContainerPermissionsPage'
import PreviewPage from './pages/PreviewPage'
import ListItemsPage from './pages/ListItemsPage'
import SearchPage from './pages/SearchPage'
import Chat from './pages/Chat'
import DebugAuthPage from './pages/DebugAuthPage'
import EnvTestPage from './pages/EnvTestPage'
import ProtectedRoute from './components/ProtectedRoute'
import AuthenticationStatus from './components/AuthenticationStatus'
import { ApiDebugPanel, ApiCallNotification } from './components/debug'
import ChatFlyout from './components/ChatFlyout'

import './App.css'

function App() {
  return (
    <AuthProvider>
      <DebugModeProvider>
        <ChatProvider>
          <Router>
            <AuthenticationStatus />
            <Navbar />
            <ApiDebugPanel />
            <ApiCallNotification />
            <ChatFlyout />
            <div className="app-container">
            <Routes>
              <Route path="/" element={<PageOne />} />
              <Route path="/page-two" element={<PageTwo />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/debug-auth" element={<DebugAuthPage />} />
              <Route path="/env-test" element={<EnvTestPage />} />
              <Route 
                path="/dashboard" 
                element={<Navigate to="/spe-explore" replace />} 
              />
              <Route 
                path="/spe-explore" 
                element={
                  <ProtectedRoute>
                    <SpeExplorePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/file-browser/:containerId/:folderId?" 
                element={
                  <ProtectedRoute>
                    <FileBrowserPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/container-permissions/:containerId" 
                element={
                  <ProtectedRoute>
                    <ContainerPermissionsPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/container-permissions" 
                element={
                  <ProtectedRoute>
                    <ContainerPermissionsPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/preview/:driveId/:itemId" 
                element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/list/:driveId/:folderId?" 
                element={
                  <ProtectedRoute>
                    <ListItemsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/search" 
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
        </ChatProvider>
      </DebugModeProvider>
    </AuthProvider>
  )
}

export default App;