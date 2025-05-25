import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccount, isAuthenticated as checkAuth, signIn, signOut, getTokenSilent, msalInstance } from './authService';
import { loginRequest } from './authConfig';

// Create authentication context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const { instance, accounts, inProgress } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isMsalInitialized, setIsMsalInitialized] = useState(false);
  
  // Check if MSAL is initialized when component mounts
  useEffect(() => {
    const checkMsalInitialization = async () => {
      try {
        if (msalInstance && msalInstance.getActiveAccount) {
          setIsMsalInitialized(true);
        }
      } catch (error) {
        console.error('MSAL initialization check failed:', error);
        setError('Authentication service not initialized properly');
      }
    };
    
    checkMsalInitialization();
  }, []);
  

  // Check authentication status on mount and when accounts change
  useEffect(() => {
    if (!isMsalInitialized) return;
    const checkAuthStatus = () => {
      const authenticated = accounts.length > 0;
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(accounts[0]);
      }
      setLoading(false);
    };
    checkAuthStatus();
  }, [accounts, isMsalInitialized]);

  // Get an access token when authenticated
  useEffect(() => {
    if (!isMsalInitialized) return;
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getTokenSilent();
          setAccessToken(token);
        } catch (error) {
          console.error('Error getting token:', error);
          setError('Failed to acquire access token');
        }
      }
    };
    getToken();
  }, [isAuthenticated, isMsalInitialized]);

  // Login function

  const login = useCallback(async () => {
    if (!isMsalInitialized) {
      setError('Authentication service not initialized properly');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [instance, isMsalInitialized]);

  // Logout function

  const logout = useCallback(async () => {
    if (!isMsalInitialized) {
      setError('Authentication service not initialized properly');
      return;
    }
    setLoading(true);
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, [instance, isMsalInitialized]);

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    error,
    accessToken,
    inProgress,
    isMsalInitialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
