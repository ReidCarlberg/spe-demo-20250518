import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { getAccount, isAuthenticated as checkAuth, signIn, signOut, getTokenSilent } from './authService';
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
  
  // Check authentication status on mount and when accounts change
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = accounts.length > 0;
      setIsAuthenticated(authenticated);
      if (authenticated) {
        setUser(accounts[0]);
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [accounts]);

  // Get an access token when authenticated
  useEffect(() => {
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
  }, [isAuthenticated]);

  // Login function
  const login = useCallback(async () => {
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
  }, [instance]);

  // Logout function
  const logout = useCallback(async () => {
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
    }  }, [instance]);

  // Auth context value
  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    error,
    accessToken,
    inProgress
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
