import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const DashboardPage = () => {
  const { isAuthenticated, user, logout, loading, accessToken } = useAuth();
  const [lastLogin, setLastLogin] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  // If still loading or not authenticated, show loading or nothing
  if (loading || !isAuthenticated) {
    return (
      <div className="dashboard-loading">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Format user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.username) return user.username;
    if (user?.localAccountId) return `User ${user.localAccountId.substring(0, 8)}`;
    return 'User';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <p className="user-greeting">Hello, {getUserDisplayName()}!</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card summary-card">
          <h2>Account Summary</h2>
          <div className="account-info">
            <p><strong>Username:</strong> {user?.username || 'Not available'}</p>
            <p><strong>Name:</strong> {user?.name || 'Not available'}</p>
            <p><strong>Account ID:</strong> {user?.localAccountId || 'Not available'}</p>
            {accessToken && (
              <p className="token-info">
                <strong>Authentication Status:</strong> <span className="authenticated-badge">Authenticated</span>
              </p>
            )}
          </div>
        </div>

        <div className="dashboard-row">
          <div className="dashboard-card">
            <h2>Recent Activity</h2>
            <p className="card-description">Your recent actions and activities will appear here.</p>
            <ul className="activity-list">
              <li>Logged in at {lastLogin}</li>
              <li>Profile viewed</li>
              <li>Dashboard accessed</li>
            </ul>
          </div>

          <div className="dashboard-card">
            <h2>Quick Actions</h2>
            <p className="card-description">Common tasks you can perform from your dashboard.</p>
            <div className="action-buttons">
              <button className="action-button">View Profile</button>
              <button className="action-button">Account Settings</button>
              <button className="action-button">Notifications</button>
              <button className="action-button logout-button" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

