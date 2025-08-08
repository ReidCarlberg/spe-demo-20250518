import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { speService } from '../services';
import './ContainerPermissionsPage.css';
import '../styles/page-one-modern.css';
import { Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Button, Field, Input, Combobox, Option, Tooltip } from '@fluentui/react-components';

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
    <div className="page-container page-one-modern">
      <div className="po-section">
        <div className="permissions-header po-section-head">
          <h1 className="po-section-title">Container Permissions</h1>
          <p className="permissions-subtitle po-section-desc">
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
          <Button 
            appearance="primary" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Permission'}
          </Button>
          <Button 
            appearance="secondary" 
            onClick={fetchPermissions}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button as={Link} to={`/file-browser/${containerId}`} appearance="secondary">
            View Files
          </Button>
          <Button appearance="secondary" onClick={() => navigate('/spe-explore')}>
            Back to Containers
          </Button>
        </div>

        {showAddForm && (
          <div className="add-permission-form dashboard-card">
            <h2>Grant New Permission</h2>
            <form onSubmit={handleSubmit} className="fluent-form">
              <div className="form-group">
                <Field label="Email Address" required>
                  <Input 
                    id="email"
                    value={newPermission.email}
                    onChange={(e, data) => setNewPermission(prev => ({ ...prev, email: data.value }))}
                    placeholder="user@example.com"
                    type="email"
                  />
                </Field>
              </div>
              <div className="form-group">
                <Field label="Role" required>
                  <Combobox
                    selectedOptions={[newPermission.role]}
                    onOptionSelect={(e, data) => setNewPermission(prev => ({ ...prev, role: data.optionValue || data.optionText }))}
                    className="role-combobox"
                  >
                    <Option value="reader">Reader</Option>
                    <Option value="writer">Writer</Option>
                    <Option value="manager">Manager</Option>
                    <Option value="owner">Owner</Option>
                  </Combobox>
                </Field>
              </div>
              <div className="form-actions">
                <Button 
                  type="submit" 
                  appearance="primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="permissions-section po-section">
          <h2>Current Permissions</h2>
          {isLoading ? (
            <p className="loading-text">Loading permissions...</p>
          ) : permissions.length === 0 ? (
            <p className="empty-state">No permissions found.</p>
          ) : (
            <div className="permissions-table-container">
              <Table>
                <colgroup>
                  <col className="col-display" />
                  <col className="col-email" />
                  <col className="col-type" />
                  <col className="col-roles" />
                  <col className="col-id" />
                </colgroup>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>Display Name</TableHeaderCell>
                    <TableHeaderCell>Email Address</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Roles</TableHeaderCell>
                    <TableHeaderCell>Permission ID</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(permission => {
                    const displayName = permission.grantedToV2?.user?.displayName || '—';
                    const email = permission.grantedToV2?.user?.email || permission.grantedToV2?.user?.userPrincipalName || '—';
                    const type = permission.grantedToV2?.user ? 'User' : (permission.grantedToV2?.group ? 'Group' : '—');
                    const roles = formatRoles(permission.roles);
                    const fullId = permission.id;
                    const shortId = fullId.length > 18 ? `${fullId.slice(0, 10)}…${fullId.slice(-4)}` : fullId;
                    return (
                      <TableRow key={permission.id} className="perm-row">
                        <TableCell title={displayName}>{displayName}</TableCell>
                        <TableCell title={email}><span className="perm-email">{email}</span></TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{roles}</TableCell>
                        <TableCell>
                          <div className="perm-id-cell">
                            <code title={fullId}>{shortId}</code>
                            <Tooltip content="Copy ID" relationship="label">
                              <Button size="small" appearance="subtle" onClick={() => navigator.clipboard.writeText(fullId)} className="copy-id-btn">Copy</Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContainerPermissionsPage;
