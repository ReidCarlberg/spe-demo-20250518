import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useChatFlyout } from '../hooks/useChatFlyout';
import { speService } from '../services';
import FilePreview from '../components/FilePreview';
import './FileBrowserPage.css';

// Icons for different file types
const FileIcon = ({ type }) => {
  let iconClass = "file-icon";
  
  switch (type) {
    case 'folder':
      iconClass += " folder-icon";
      return <span className={iconClass}><i className="fas fa-folder"></i></span>;
    case 'pdf':
      iconClass += " pdf-icon";
      return <span className={iconClass}><i className="fas fa-file-pdf"></i></span>;
    case 'word':
    case 'docx':
    case 'doc':
      iconClass += " word-icon";
      return <span className={iconClass}><i className="fas fa-file-word"></i></span>;
    case 'excel':
    case 'xlsx':
    case 'xls':
      iconClass += " excel-icon";
      return <span className={iconClass}><i className="fas fa-file-excel"></i></span>;
    case 'powerpoint':
    case 'pptx':
    case 'ppt':
      iconClass += " powerpoint-icon";
      return <span className={iconClass}><i className="fas fa-file-powerpoint"></i></span>;
    case 'image':
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      iconClass += " image-icon";
      return <span className={iconClass}><i className="fas fa-file-image"></i></span>;
    case 'text':
    case 'txt':
      iconClass += " text-icon";
      return <span className={iconClass}><i className="fas fa-file-alt"></i></span>;
    default:
      return <span className={iconClass}><i className="fas fa-file"></i></span>;
  }
};

const FileBrowserPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const { setContainer } = useChatFlyout();
  const navigate = useNavigate();
  const { containerId, folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [container, setContainerState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(folderId || 'root');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);
  
  // Fetch container details when component mounts
  useEffect(() => {
    if (containerId && isAuthenticated) {
      const fetchContainerDetails = async () => {
        try {
          // Get all containers and find the one with matching ID
          const containers = await speService.getContainers();
          const containerMatch = containers.find(c => c.id === containerId);
          
          if (containerMatch) {
            setContainerState(containerMatch);
            // Set container in chat context for ChatFlyout
            setContainer(containerMatch.id, containerMatch.displayName);
            
            // Initialize the path with container name
            if (currentPath.length === 0) {
              setCurrentPath([{ name: 'Home', id: 'root' }, { name: containerMatch.displayName, id: 'root' }]);
            }
          } else {
            setError('Container not found');
          }
        } catch (error) {
          console.error('Error fetching container details:', error);
          setError('Failed to load container details: ' + error.message);
        }
      };
      
      fetchContainerDetails();
    }
  }, [containerId, isAuthenticated, currentPath.length, setContainer]);

  // Fetch files when component mounts or folder changes
  useEffect(() => {
    if (containerId && isAuthenticated && container) {
      fetchFiles(currentFolderId);
    }
  }, [containerId, isAuthenticated, container, currentFolderId]);

  const fetchFiles = async (folderId) => {
    setIsLoading(true);
    try {
      const data = await speService.listFiles(containerId, folderId);
      setFiles(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToFolder = async (folder) => {
    try {
      // Update the current folder ID
      setCurrentFolderId(folder.id);
      
      // Update the path
      if (folder.id === 'root') {
        // Reset to the root path
        setCurrentPath([{ name: 'Home', id: 'root' }, { name: container.displayName, id: 'root' }]);
      } else {
        // Add the new folder to the path
        const newPath = [...currentPath];
        
        // If the folder is already in the path, trim the path to that point
        const existingIndex = newPath.findIndex(item => item.id === folder.id);
        
        if (existingIndex >= 0) {
          setCurrentPath(newPath.slice(0, existingIndex + 1));
        } else {
          // Otherwise add the folder to the path
          setCurrentPath([...newPath, { name: folder.name, id: folder.id }]);
        }
      }
    } catch (error) {
      console.error('Error navigating to folder:', error);
      setError('Failed to navigate to folder: ' + error.message);
    }
  };

  const getFileTypeFromMime = (mimeType, name) => {
    if (!mimeType) {
      // Try to get type from extension
      const extension = name.split('.').pop().toLowerCase();
      
      switch (extension) {
        case 'pdf': return 'pdf';
        case 'doc': case 'docx': return 'word';
        case 'xls': case 'xlsx': return 'excel';
        case 'ppt': case 'pptx': return 'powerpoint';
        case 'jpg': case 'jpeg': case 'png': case 'gif': return 'image';
        case 'txt': return 'text';
        default: return 'file';
      }
    }
    
    if (mimeType.includes('folder')) return 'folder';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word')) return 'word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'powerpoint';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('text')) return 'text';
    
    return 'file';
  };

  const handleFileClick = (file) => {
    if (file.folder) {
      navigateToFolder(file);
    } else {
      // Handle file preview or open
      console.log('Open file', file);
      // For now, just open the file in a new tab if it has a webUrl
      if (file.webUrl) {
        window.open(file.webUrl, '_blank');
      }
    }
  };
  
  const handlePreviewClick = async (event, file) => {
    event.stopPropagation(); // Prevent parent click event
    
    try {
      // Only handle non-Office files like PDF, JPEG, etc.
      if (file.id && containerId) {
        setPreviewFile(file);
        setPreviewLoading(true);
        setPreviewError(null);
        
        // Get the preview URL from the SPE service
        const previewUrl = await speService.getFilePreviewUrl(containerId, file.id);
        
        setPreviewFile({
          ...file,
          url: previewUrl,
          name: file.name
        });
        setPreviewLoading(false);
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      setPreviewError(error.message || 'Failed to load file preview');
      setPreviewLoading(false);
    }
  };
  
  const closePreview = () => {
    setPreviewFile(null);
    setPreviewLoading(false);
    setPreviewError(null);
  };
  
  // Handle file deletion
  const handleDeleteFile = async (e, file) => {
    e.stopPropagation();
    
    // Confirm deletion with the user
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await speService.deleteFile(containerId, file.id);
      
      // Refresh the file list
      await fetchFiles(currentFolderId);
      
      // If this was the file being previewed, close the preview
      if (previewFile && previewFile.name === file.name) {
        closePreview();
      }
      
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(`Failed to delete file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const isPreviewableFile = (file) => {
    if (!file || file.folder) return false;
    
    const fileExtension = file.name?.split('.').pop()?.toLowerCase();
    const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'webp'];
    
    // Check if it's a known previewable type
    return previewableExtensions.includes(fileExtension) || 
           (file.file?.mimeType && (
             file.file.mimeType.startsWith('image/') || 
             file.file.mimeType === 'application/pdf'
           ));
  };
  
  const isOfficeFile = (file) => {
    if (!file || file.folder) return false;
    
    const fileExtension = file.name?.split('.').pop()?.toLowerCase();
    const officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    return officeExtensions.includes(fileExtension) || 
           (file.file?.mimeType && (
             file.file.mimeType.includes('word') || 
             file.file.mimeType.includes('excel') || 
             file.file.mimeType.includes('powerpoint') || 
             file.file.mimeType.includes('spreadsheet') || 
             file.file.mimeType.includes('presentation')
           ));
  };
  
  const handleDownloadClick = async (event, file) => {
    event.stopPropagation(); // Prevent parent click event
    
    try {
      if (!file || !file.id) {
        throw new Error('Invalid file information');
      }
      
      // If the file has a direct download URL, use it
      if (file.webUrl) {
        const downloadURL = file.webUrl;
        // Create a hidden anchor element for download
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadURL;
        downloadLink.download = file.name; // Set the filename
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        // Fallback - you would need to implement a method to fetch the file content
        console.log('Download URL not available for this file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(`Failed to download file: ${error.message}`);
    }
  };
  
  const handlePathClick = (pathItem, index) => {
    if (index === 0) {
      // Clicking on "Home" should navigate back to the containers list
      navigate('/spe-explore');
    } else {
      // Otherwise navigate to the selected folder in the path
      navigateToFolder({ id: pathItem.id, name: pathItem.name });
      // Trim the path to this point
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;
    
    uploadFiles(files);
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length === 0) return;
    
    uploadFiles(files);
  };
  
  const uploadFiles = async (files) => {
    if (!containerId || !currentFolderId) {
      setError('Container or folder not specified');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Report progress based on file count
        setUploadProgress((i / files.length) * 100);
        
        await speService.uploadFile(
          containerId,
          currentFolderId,
          file,
          (progress) => {
            // Calculate overall progress including previous files
            const overallProgress = ((i + progress) / files.length) * 100;
            setUploadProgress(overallProgress);
          }
        );
      }
      
      // Upload complete
      setUploadProgress(100);
      
      // Refresh the file list
      await fetchFiles(currentFolderId);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('File upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      // If search term is empty, clear search results and show all files
      setSearchResults(null);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await speService.searchFiles(containerId, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching files:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Clear search results and reset to current folder view
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && previewFile) {
        closePreview();
      }
    };

    if (previewFile) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [previewFile]);
  
  // If still loading or not authenticated, show loading
  if (loading || !isAuthenticated) {
    return (
      <div className="file-browser-loading">
        <p>Loading file browser...</p>
      </div>
    );
  }  return (
    <div className="file-browser-wrapper">
      <div className="file-browser-container">
        <div className="file-browser-header">
          <div className="file-browser-title">
            <h1>File Browser</h1>
            <p className="file-browser-subtitle">
              {container ? container.displayName : 'Loading container...'}
            </p>
          </div>
        </div>

        {error && (
          <div className="file-browser-error">
            <p>{error}</p>
          </div>
        )}

        <div className="file-browser-path">
          {currentPath.map((pathItem, index) => (
            <span key={index}>
              <span 
                className="path-item" 
                onClick={() => handlePathClick(pathItem, index)}
              >
                {pathItem.name}
              </span>
              {index < currentPath.length - 1 && <span className="path-separator"> &gt; </span>}
            </span>
          ))}
        </div>


        
        <div className="file-browser-actions">
          <button 
            className="file-browser-button refresh-button" 
            onClick={() => fetchFiles(currentFolderId)}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Files'}
          </button>
          <button
            className="file-browser-button upload-button"
            onClick={triggerFileInput}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
            multiple
          />
          <Link to="/spe-explore" className="file-browser-button back-button">
            Back to Containers
          </Link>
        </div>

        {isUploading && (
          <div className="upload-progress-container">
            <div 
              className="upload-progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <div className="upload-progress-text">
              Uploading: {Math.round(uploadProgress)}%
            </div>
          </div>
        )}
          <div className="files-section">
          {isSearching ? (
            <p className="loading-text">Searching files...</p>
          ) : isLoading ? (
            <p className="loading-text">Loading files...</p>
          ) : searchResults ? (
            // Display search results
            searchResults.length === 0 ? (
              <div className="empty-state">
                <p>No files found matching "{searchTerm}"</p>
                <button className="file-browser-button" onClick={clearSearch}>
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="files-list search-results">
                <div className="search-results-header">
                  <h3>Search Results for "{searchTerm}"</h3>
                  <button className="file-browser-button" onClick={clearSearch}>
                    Clear Search
                  </button>
                </div>
                {searchResults.map(file => {
                  const fileType = file.folder ? 'folder' : getFileTypeFromMime(file.file?.mimeType, file.name);
                  
                  return (
                    <div 
                      className="file-item search-result-item" 
                      key={file.id}
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="file-icon-container">
                        <FileIcon type={fileType} />
                      </div>
                      <div className="file-details">
                        <div className="file-name">{file.name}</div>
                        <div className="file-meta">
                          {!file.folder && <span className="file-size">{file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}</span>}
                          {file.lastModifiedDateTime && (
                            <span className="file-date">
                              Modified: {new Date(file.lastModifiedDateTime).toLocaleString()}
                            </span>
                          )}
                          {file.parentReference && file.parentReference.path && (
                            <span className="file-path">
                              Path: {file.parentReference.path.replace('/drive/root:', '')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="file-actions">
                        {file.folder ? (
                          <>
                            <button className="file-action-button" onClick={(e) => { e.stopPropagation(); navigateToFolder(file); }}>
                              <i className="fas fa-folder-open"></i>
                            </button>
                            <button className="file-action-button delete-button" onClick={(e) => handleDeleteFile(e, file)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            {isPreviewableFile(file) && !isOfficeFile(file) && (
                              <button 
                                className="file-action-button preview-button" 
                                onClick={(e) => handlePreviewClick(e, file)}
                                title={`Preview ${file.name}`}
                              >
                                <i className="fas fa-eye"></i>
                                <span className="file-action-text">Preview</span>
                              </button>
                            )}
                            <button 
                              className="file-action-button" 
                              onClick={(e) => handleDownloadClick(e, file)}
                              title="Download file"
                            >
                              <i className="fas fa-download"></i>
                            </button>
                            <button 
                              className="file-action-button delete-button" 
                              onClick={(e) => handleDeleteFile(e, file)}
                              title="Delete file"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : files.length === 0 ? (
            <div 
              className="empty-state drop-zone" 
              onDragOver={handleDragOver} 
              onDrop={handleDrop}
            >
              <p>This folder is empty.</p>
              <p className="drop-instructions">Drop files here to upload or use the Upload button above.</p>
            </div>
          ) : (
            <div 
              className="files-list"
              onDragOver={handleDragOver} 
              onDrop={handleDrop}
            >
              {files.map(file => {
                const fileType = file.folder ? 'folder' : getFileTypeFromMime(file.file?.mimeType, file.name);
                
                return (
                  <div 
                    className="file-item" 
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="file-icon-container">
                      <FileIcon type={fileType} />
                    </div>
                    <div className="file-details">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        {!file.folder && <span className="file-size">{file.size ? `${Math.round(file.size / 1024)} KB` : 'Unknown size'}</span>}
                        {file.lastModifiedDateTime && (
                          <span className="file-date">
                            Modified: {new Date(file.lastModifiedDateTime).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                      <div className="file-actions">
                      {file.folder ? (
                        <>
                          <button className="file-action-button" onClick={(e) => { e.stopPropagation(); navigateToFolder(file); }}>
                            <i className="fas fa-folder-open"></i>
                          </button>
                          <button className="file-action-button delete-button" onClick={(e) => handleDeleteFile(e, file)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      ) : (
                        <>
                          {isPreviewableFile(file) && !isOfficeFile(file) && (
                            <button 
                              className="file-action-button preview-button" 
                              onClick={(e) => handlePreviewClick(e, file)}
                              title={`Preview ${file.name}`}
                            >
                              <i className="fas fa-eye"></i>
                              <span className="file-action-text">Preview</span>
                            </button>
                          )}
                          <button 
                            className="file-action-button" 
                            onClick={(e) => handleDownloadClick(e, file)}
                            title="Download file"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button 
                            className="file-action-button delete-button" 
                            onClick={(e) => handleDeleteFile(e, file)}
                            title="Delete file"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Document Preview Modal */}
        {previewFile && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closePreview();
              }
            }}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90vw',
                maxWidth: '1100px',
                height: '75vh',
                minHeight: '350px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ 
                padding: '20px', 
                borderBottom: '1px solid #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'white',
                borderRadius: '12px 12px 0 0'
              }}>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                  {previewFile.name}
                </h2>
                <button 
                  onClick={closePreview}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '4px 8px'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {previewLoading ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%' 
                  }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #f3f3f3',
                      borderTop: '4px solid #3498db',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginBottom: '10px'
                    }}></div>
                    <p>Loading preview...</p>
                  </div>
                ) : previewError ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    textAlign: 'center', 
                    padding: '20px' 
                  }}>
                    <h3>Error Loading Preview</h3>
                    <p>{previewError}</p>
                    <button 
                      onClick={closePreview} 
                      style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                ) : previewFile.url ? (
                  <iframe 
                    src={previewFile.url} 
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                    title={`Preview of ${previewFile.name}`}
                    sandbox="allow-scripts allow-same-origin allow-forms" 
                  />
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%', 
                    textAlign: 'center', 
                    padding: '20px' 
                  }}>
                    <h3>Preview Not Available</h3>
                    <p>This file type cannot be previewed.</p>
                    <button 
                      onClick={closePreview} 
                      style={{ 
                        marginTop: '10px', 
                        padding: '8px 16px',
                        backgroundColor: '#0078d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowserPage;
