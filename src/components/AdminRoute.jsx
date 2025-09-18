import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

/** AdminRoute: protects routes that require admin access */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <div style={{ padding: '2rem' }}><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  return children;
};

export default AdminRoute;
