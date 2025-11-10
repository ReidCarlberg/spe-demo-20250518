import { useEffect, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * AuthenticationStatus component
 * This component checks the authentication status and provides visual feedback
 * It also handles automatic navigation to the documents tab when the user logs in.
 */
const AuthenticationStatus = () => {
  const { instance, accounts, inProgress: msalInProgress } = useMsal();
  const { isAuthenticated, inProgress } = useAuth();
  const navigate = useNavigate();
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    // Log authentication status for debugging
    console.log('Authentication Status:', {
      isAuthenticated,
      accountsLength: accounts.length,
      msalInProgress,
      authInProgress: inProgress
    });
  }, [isAuthenticated, accounts, msalInProgress, inProgress]);

  useEffect(() => {
    // If authentication transitioned from false -> true, navigate to documents tab
    const prev = prevAuthRef.current;
    if (!prev && isAuthenticated) {
      // Ensure we aren't mid-login work-in-progress
      // Use replace to avoid back-button landing on login
      navigate('/spe-explore', { replace: true });
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, navigate]);

  return null; // Utility component, doesn't render anything
};

export default AuthenticationStatus;
