import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';
import { speService } from '../services';

const SpeExplorePage = () => {
  const { isAuthenticated, loading, accessToken } = useAuth();
  const { getDocumentsContent } = useTheme();
  const navigate = useNavigate();
  
  const [containers, setContainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContainer, setNewContainer] = useState({
    displayName: '',
    description: '',
    isOcrEnabled: false
  });

  // Get theme-based content
  const documentsContent = getDocumentsContent();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);

  useEffect(() => {
    // Fetch containers when component mounts and user is authenticated
    if (isAuthenticated && accessToken) {
      fetchContainers();
    }
  }, [isAuthenticated, accessToken]);

  const fetchContainers = async () => {
    setIsLoading(true);
    try {
      const data = await speService.getContainers();
      setContainers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching containers:', error);
      setError('Failed to load containers. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContainer = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const createdContainer = await speService.createContainer(newContainer);
      setContainers([...containers, createdContainer]);
      setNewContainer({ displayName: '', description: '', isOcrEnabled: false });
      setShowCreateForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating container:', error);
      setError('Failed to create container. ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    setNewContainer({ ...newContainer, [name]: inputValue });
  };

  const handleViewDocuments = (containerId) => {
    navigate(`/file-browser/${containerId}`);
  };
  const handleDeleteContainer = async (containerId, containerName) => {
    // Confirm deletion with the user
    if (!window.confirm(`Are you sure you want to delete the container "${containerName}"? This will permanently delete all files within it.`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await speService.deleteContainer(containerId);
      
      // Refresh the containers list after deletion
      fetchContainers();
      
    } catch (error) {
      console.error('Error deleting container:', error);
      setError(`Failed to delete container: ${error.message}`);
      setIsLoading(false);
    }  };

  // Calculate how many days ago the container was created
  const getDaysAgo = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Function to get a status class based on creation date
  const getStatusClass = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) return 'status-new';
    if (diffDays < 30) return 'status-recent';
    return 'status-old';
  };

  // If still loading or not authenticated, show loading or nothing
  if (loading || !isAuthenticated) {
    return (
      <div className="spe-loading">
        <p>Loading SharePoint Embedded explorer...</p>
      </div>
    );
  }

  return (
    <div className="spe-container">
      <div className="spe-header">
        <h1>{documentsContent.pageTitle}</h1>
        <p className="spe-subtitle">{documentsContent.pageSubtitle}</p>
      </div>

      {error && (
        <div className="spe-error">
          <p>{error}</p>
        </div>
      )}

      <div className="spe-actions">
        <button 
          className="spe-button create-button" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : documentsContent.createButtonText}
        </button>

      </div>

      {showCreateForm && (
        <div className="create-container-form">
          <h2>Create New Container</h2>
          <form onSubmit={handleCreateContainer}>
            <div className="form-group">
              <label htmlFor="displayName">Container Name</label>
              <input 
                type="text" 
                id="displayName" 
                name="displayName" 
                value={newContainer.displayName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                name="description" 
                value={newContainer.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="isOcrEnabled" className="checkbox-label">
                <input 
                  type="checkbox" 
                  id="isOcrEnabled" 
                  name="isOcrEnabled" 
                  checked={newContainer.isOcrEnabled}
                  onChange={handleInputChange}
                />
                Enable OCR (Optical Character Recognition)
              </label>
              <small className="form-help-text">
                OCR allows text extraction from images and scanned documents uploaded to this container.
              </small>
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="spe-button submit-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Container'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="containers-section">
        <h2>{documentsContent.containersHeadline}</h2>
        {isLoading ? (
          <p className="loading-text">Loading containers...</p>
        ) : containers.length === 0 ? (
          <p className="empty-state">No containers found. Create one to get started.</p>
        ) : (
          <div className="containers-grid">
            {containers.map(container => (
              <div className="container-card" key={container.id}>                <div className="container-badge"></div>
                <h3>{container.displayName}</h3>
                <p className={`container-date ${getStatusClass(container.createdDateTime)}`}>
                  Created: {getDaysAgo(container.createdDateTime)}
                </p>
                <div className="container-details">
                  <p title={container.id}><strong>ID:</strong> {container.id}</p>
                  <p><strong>Created:</strong> {new Date(container.createdDateTime).toLocaleString()}</p>
                </div>
                <div className="container-actions">
                  <button 
                    className="spe-button view-button"
                    onClick={() => handleViewDocuments(container.id)}
                  >
                    View Documents
                  </button>
                  <Link 
                    className="spe-button permissions-button"
                    to={`/container-permissions/${container.id}`}
                  >
                    Manage Permissions
                  </Link>
                  <button 
                    className="spe-button delete-button"
                    onClick={() => handleDeleteContainer(container.id, container.displayName)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Container'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeExplorePage;
