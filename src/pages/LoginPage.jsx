import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const { isAuthenticated, login, loading, error, inProgress } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to SPE Explore if already authenticated
    if (isAuthenticated && !loading) {
      navigate('/spe-explore');
    }
  }, [isAuthenticated, navigate, loading]);

  const handleLogin = async () => {
    await login();
  };

  const isLoading = loading || inProgress === 'login';

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{currentTheme.name}</h1>
        <p className="login-subtitle">Sign in to get started.</p>

        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <button 
          className="login-button" 
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
        </button>
        
        <div className="login-footer">
          <p>This application uses Microsoft Authentication Library (MSAL) for secure sign-in.</p>
          <p>Your credentials are never stored by this application.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
