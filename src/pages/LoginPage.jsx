import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, Divider, Button, Spinner, Text } from '@fluentui/react-components';
import '../styles/page-one-modern.css';

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
    <div className="page-container page-one-modern" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Card className="po-login-card" appearance="filled">
        <CardHeader
          header={<Text weight="semibold" size={600}>{currentTheme.name}</Text>}
          description={<Text>Sign in to get started.</Text>}
        />
        <Divider />
        <div className="po-login-body">
          {error && (
            <div className="error-alert">
              <p>{error}</p>
            </div>
          )}
          <Button appearance="primary" size="large" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? (<><Spinner size="tiny" style={{ marginRight: 8 }} /> Signing in…</>) : 'Sign in with Microsoft'}
          </Button>
          <Text size={300} className="po-login-footnote">
            This application uses Microsoft Authentication Library (MSAL) for secure sign-in. Your credentials are never stored by this application.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
