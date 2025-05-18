import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../AuthContext';

/**
 * AuthenticationStatus component
 * This component checks the authentication status and provides visual feedback
 * It also handles automatic token acquisition at startup
 */
const AuthenticationStatus = () => {
  const { instance, accounts, inProgress } = useMsal();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Log authentication status for debugging
    console.log('Authentication Status:', {
      isAuthenticated,
      accountsLength: accounts.length,
      inProgress
    });
  }, [isAuthenticated, accounts, inProgress]);

  return null; // This is just a utility component, doesn't render anything
};

export default AuthenticationStatus;
