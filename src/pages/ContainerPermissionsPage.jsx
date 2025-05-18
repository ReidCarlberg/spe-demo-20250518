import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { speService } from '../speService';
import './ContainerPermissionsPage.css';

const ContainerPermissionsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { containerId } = useParams();
  
  const [container, setContainer] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state for adding a new permission
  const [newPermission, setNewPermission] = useState({
    email: '',
    role: 'reader'
  });
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  // Fetch container details and permissions when component mounts
  useEffect(() => {
    if (containerId && isAuthenticated) {
      fetchContainerDetails();
      fetchPermissions();
    }
  }, [containerId, isAuthenticated]);

  const fetchContainerDetails = async () => {
    try {
      // Get all containers and find the one with matching ID
      const containers = await speService.getContainers();
      const containerMatch = containers.find(c => c.id === containerId);
      
      if (containerMatch) {
        setContainer(containerMatch);
      } else {
        setError('Container not found');
      }
    } catch (error) {
      console.error('Error fetching container details:', error);
      setError('Failed to load container details: ' + error.message);
    }
  };

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const perms = await speService.getContainerPermissions(containerId);
      setPermissions(perms);
      setError(null);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Failed to load permissions: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPermission({ ...newPermission, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Validate form
      if (!newPermission.email) {
        throw new Error('Email address is required');
      }
      
      if (!newPermission.role) {
        throw new Error('Role is required');
      }
      
      // Grant permission
      await speService.grantContainerPermission(
        containerId,
        newPermission.email,
        newPermission.role
      );
      
      // Reset form
      setNewPermission({
        email: '',
        role: 'reader'
      });
      
      // Show success message
      setSuccessMessage('Permission granted successfully!');
      
      // Refresh permissions list
      fetchPermissions();
      
      // Hide form after successful submission
      setShowAddForm(false);
    } catch (error) {
      console.error('Error granting permission:', error);
      setError('Failed to grant permission: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Format roles as a readable list
  const formatRoles = (roles) => {
    if (!roles || !roles.length) return 'None';
    
    return roles.map(role => {
      // Capitalize first letter
      return role.charAt(0).toUpperCase() + role.slice(1);
    }).join(', ');
  };

  // If still loading or not authenticated, show loading
  if (loading || !isAuthenticated) {
    return (
      <div className="permissions-loading">
        <p>Loading permissions...</p>
      </div>
    );
  }

  return (
    <div className="permissions-container">
      <div className="permissions-header">
        <h1>Container Permissions</h1>
        <p className="permissions-subtitle">
          {container ? container.displayName : 'Loading container...'}
        </p>
      </div>

      {error && (
        <div className="permissions-error">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="permissions-success">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="permissions-actions">
        <button 
          className="permissions-button" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Permission'}
        </button>
        <button 
          className="permissions-button refresh-button" 
          onClick={fetchPermissions}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
        <Link 
          to={`/file-browser/${containerId}`} 
          className="permissions-button"
        >
          View Files
        </Link>
        <Link 
          to="/spe-explore" 
          className="permissions-button back-button"
        >
          Back to Containers
        </Link>
      </div>

      {showAddForm && (
        <div className="add-permission-form">
          <h2>Grant New Permission</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={newPermission.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role" 
                name="role" 
                value={newPermission.role}
                onChange={handleInputChange}
                required
              >
                <option value="reader">Reader</option>
                <option value="writer">Writer</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="permissions-button submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="permissions-section">
        <h2>Current Permissions</h2>
        {isLoading ? (
          <p className="loading-text">Loading permissions...</p>
        ) : permissions.length === 0 ? (
          <p className="empty-state">No permissions found.</p>
        ) : (
          <div className="permissions-table-container">
            <table className="permissions-table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Email Address</th>
                  <th>Type</th>
                  <th>Roles</th>
                  <th>Permission ID</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(permission => (
                  <tr key={permission.id}>
                    <td>{permission.grantedToV2?.user?.displayName || '—'}</td>
                    <td>{permission.grantedToV2?.user?.email || permission.grantedToV2?.user?.userPrincipalName || '—'}</td>
                    <td>{permission.grantedToV2?.user ? 'User' : (permission.grantedToV2?.group ? 'Group' : '—')}</td>
                    <td>{formatRoles(permission.roles)}</td>
                    <td><span className="permission-id">{permission.id}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContainerPermissionsPage;
