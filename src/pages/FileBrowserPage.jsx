import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useChatFlyout } from '../hooks/useChatFlyout';
import { speService } from '../services';
import FilePreview from '../components/FilePreview';
import DriveInfoModal from '../components/DriveInfoModal';

// New components
import BreadcrumbNavigation from '../components/FileBrowser/BreadcrumbNavigation';
import SearchBar from '../components/FileBrowser/SearchBar';
import Toolbar from '../components/FileBrowser/Toolbar';
import FileList from '../components/FileBrowser/FileList';
import UploadProgress from '../components/FileBrowser/UploadProgress';
import CreateFileDialog from '../components/FileBrowser/dialogs/CreateFileDialog';
import CreateFolderDialog from '../components/FileBrowser/dialogs/CreateFolderDialog';
import RenameItemDialog from '../components/FileBrowser/dialogs/RenameItemDialog';
import MetadataDialog from '../components/FileBrowser/dialogs/MetadataDialog';
import ColumnsDialog from '../components/FileBrowser/dialogs/ColumnsDialog';
import DocumentFieldsDialog from '../components/FileBrowser/dialogs/DocumentFieldsDialog';
import ShareDialog from '../components/FileBrowser/dialogs/ShareDialog';

// Custom hooks
import { useFileOperations } from '../hooks/FileBrowser/useFileOperations';
import { useSearch } from '../hooks/FileBrowser/useSearch';
import { useContainerData } from '../hooks/FileBrowser/useContainerData';
import { useFileFields } from '../hooks/FileBrowser/useFileFields';

// Utils
import { isPreviewableFile, isOfficeFile } from '../components/FileBrowser/fileUtils';

import './FileBrowserPage.css';
import '../styles/page-one-modern.css';

function FileBrowserPage() {
  const { isAuthenticated, loading } = useAuth();
  const { setContainer } = useChatFlyout();
  const navigate = useNavigate();
  const { containerId, folderId } = useParams();
  
  // Core state
  const [files, setFiles] = useState([]);
  const [container, setContainerState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(folderId || 'root');
  
  // Preview state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  
  // Drive info state
  const [showDriveInfo, setShowDriveInfo] = useState(false);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [showMetaDialog, setShowMetaDialog] = useState(false);
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [showFieldsDialog, setShowFieldsDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareFile, setShareFile] = useState(null);

  // Custom hooks
  const fileOps = useFileOperations(containerId, currentFolderId, fetchFiles);
  const search = useSearch(containerId);
  const containerData = useContainerData(containerId);
  const fileFields = useFileFields(containerId);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, loading]);
  
  // Fetch container details when component mounts
  useEffect(() => {
    if (containerId && isAuthenticated) {
      const fetchContainerDetails = async () => {
        try {
          const containers = await speService.getContainers();
          const containerMatch = containers.find(c => c.id === containerId);
          
          if (containerMatch) {
            setContainerState(containerMatch);
            setContainer(containerMatch.id, containerMatch.displayName);
            
            if (currentPath.length === 0) {
              setCurrentPath([
                { name: 'Home', id: 'root' }, 
                { name: containerMatch.displayName, id: 'root' }
              ]);
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
      fetchFiles();
    }
  }, [containerId, isAuthenticated, container, currentFolderId]);

  async function fetchFiles() {
    setIsLoading(true);
    try {
      const data = await speService.listFiles(containerId, currentFolderId);
      setFiles(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to load files: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }

  const navigateToFolder = async (folder) => {
    try {
      setCurrentFolderId(folder.id);
      
      if (folder.id === 'root') {
        setCurrentPath([
          { name: 'Home', id: 'root' }, 
          { name: container.displayName, id: 'root' }
        ]);
      } else {
        const newPath = [...currentPath];
        const existingIndex = newPath.findIndex(item => item.id === folder.id);
        
        if (existingIndex >= 0) {
          setCurrentPath(newPath.slice(0, existingIndex + 1));
        } else {
          setCurrentPath([...newPath, { name: folder.name, id: folder.id }]);
        }
      }
    } catch (error) {
      console.error('Error navigating to folder:', error);
      setError('Failed to navigate to folder: ' + error.message);
    }
  };

  const handleFileClick = (file) => {
    if (file.folder) {
      navigateToFolder(file);
    } else {
      if (isPreviewableFile(file) && !isOfficeFile(file)) {
        openPreview(file);
        return;
      }
      if (file.webUrl) {
        window.open(file.webUrl, '_blank');
      }
    }
  };

  const openPreview = async (file) => {
    try {
      if (file.id && containerId) {
        setPreviewFile(file);
        setPreviewLoading(true);
        setPreviewError(null);
        
        const previewUrl = await fileOps.getFilePreviewUrl(file);
        
        setPreviewFile({
          ...file,
          url: previewUrl,
          name: file.name
        });
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      setPreviewError(error.message || 'Failed to load file preview');
    } finally {
      setPreviewLoading(false);
    }
  };
  
  const closePreview = () => {
    setPreviewFile(null);
    setPreviewLoading(false);
    setPreviewError(null);
  };

  const handleDownloadClick = async (file) => {
    try {
      if (!file || !file.id) {
        throw new Error('Invalid file information');
      }
      
      if (file.webUrl) {
        const downloadLink = document.createElement('a');
        downloadLink.href = file.webUrl;
        downloadLink.download = file.name;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } else {
        console.log('Download URL not available for this file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError(`Failed to download file: ${error.message}`);
    }
  };

  const handlePathClick = (pathItem, index) => {
    if (index === 0) {
      navigate('/spe-explore');
    } else {
      navigateToFolder({ id: pathItem.id, name: pathItem.name });
      setCurrentPath(currentPath.slice(0, index + 1));
    }
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
    
    fileOps.uploadFiles(files);
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;
    fileOps.uploadFiles(files);
  };

  // Dialog handlers
  const handleDriveInfoClick = async () => {
    try {
      const info = await containerData.fetchDriveInfo();
      setShowDriveInfo(true);
    } catch (err) {
      setError('Failed to load drive info: ' + err.message);
    }
  };

  const handleOpenFieldsDialog = async (file) => {
    try {
      await fileFields.loadFileFields(file);
      setShowFieldsDialog(true);
    } catch (err) {
      setError('Failed to load file fields: ' + err.message);
    }
  };

  const handleDeleteFile = async (file) => {
    const deleted = await fileOps.deleteFile(file);
    if (deleted && previewFile && previewFile.name === file.name) {
      closePreview();
    }
  };

  const handleOpenShareDialog = (file) => {
    setShareFile(file);
    setShowShareDialog(true);
  };

  const handleShareFile = async (file, email, role, sendInvitation) => {
    return await fileOps.shareFile(file, email, role, sendInvitation);
  };

  const handleRename = (item) => {
    setItemToRename(item);
    setShowRenameDialog(true);
  };

  const handleRenameSubmit = async (itemId, newName, oldName) => {
    try {
      await fileOps.renameItem(itemId, newName, oldName);
      setShowRenameDialog(false);
      setItemToRename(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleRenameCancel = () => {
    setShowRenameDialog(false);
    setItemToRename(null);
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="file-browser-loading">
        <p>Loading file browser...</p>
      </div>
    );
  }

  const displayFiles = search.searchResults || files;
  const isSearchMode = !!search.searchResults;

  return (
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

        {(error || fileOps.error || search.error || containerData.error) && (
          <div className="file-browser-error">
            <p>{error || fileOps.error || search.error || containerData.error}</p>
          </div>
        )}

        <BreadcrumbNavigation 
          currentPath={currentPath}
          onPathClick={handlePathClick}
        />

        <SearchBar
          searchTerm={search.searchTerm}
          onSearchTermChange={search.setSearchTerm}
          onSearch={() => search.handleSearch()}
          onClear={search.clearSearch}
          hasResults={isSearchMode}
          isSearching={search.isSearching}
        />

        <Toolbar
          isLoading={isLoading}
          isUploading={fileOps.isUploading}
          onRefresh={fetchFiles}
          onUpload={fileOps.triggerFileInput}
          onCreateFile={() => setShowCreateDialog(true)}
          onCreateFolder={() => setShowCreateFolderDialog(true)}
          onBackToContainers={() => navigate('/spe-explore')}
          onDriveInfo={handleDriveInfoClick}
          onMetadata={() => setShowMetaDialog(true)}
          onColumns={() => setShowColumnsDialog(true)}
        />

        <input
          type="file"
          ref={fileOps.fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
          multiple
        />

        <UploadProgress 
          isUploading={fileOps.isUploading}
          progress={fileOps.uploadProgress}
        />

        <div className="files-section" style={{ marginTop: 12 }}>
          {search.isSearching ? (
            <p className="loading-text">Searching files...</p>
          ) : (
            <FileList
              files={displayFiles}
              isLoading={isLoading}
              onFileClick={handleFileClick}
              onPreview={openPreview}
              onDownload={handleDownloadClick}
              onEditFields={handleOpenFieldsDialog}
              onDelete={handleDeleteFile}
              onShare={handleOpenShareDialog}
              onRename={handleRename}
              onNavigateToFolder={navigateToFolder}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onTriggerFileInput={fileOps.triggerFileInput}
            />
          )}
        </div>

        {/* Modals and Dialogs */}
        {previewFile && (
          <FilePreview 
            fileUrl={previewFile.url} 
            fileName={previewFile.name} 
            onClose={closePreview} 
          />
        )}

        {showDriveInfo && (
          <DriveInfoModal 
            driveInfo={containerData.driveInfo} 
            onClose={() => setShowDriveInfo(false)} 
          />
        )}

        <CreateFileDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateFile={fileOps.createBlankFile}
        />

        <CreateFolderDialog
          open={showCreateFolderDialog}
          onOpenChange={setShowCreateFolderDialog}
          onCreateFolder={fileOps.createFolder}
        />

        <RenameItemDialog
          open={showRenameDialog}
          onOpenChange={setShowRenameDialog}
          onRename={handleRenameSubmit}
          item={itemToRename}
          error={fileOps.error}
        />

        <MetadataDialog
          open={showMetaDialog}
          onOpenChange={setShowMetaDialog}
          properties={containerData.properties}
          loading={containerData.loading}
          error={containerData.error}
          onAddProperty={containerData.addProperty}
          onLoadProperties={containerData.fetchProperties}
        />

        <ColumnsDialog
          open={showColumnsDialog}
          onOpenChange={setShowColumnsDialog}
          columns={containerData.columns}
          loading={containerData.loading}
          error={containerData.error}
          onLoadColumns={containerData.fetchColumns}
          onCreateColumn={containerData.createColumn}
          onUpdateColumn={containerData.updateColumn}
          onDeleteColumn={containerData.deleteColumn}
          inferColumnType={containerData.inferColumnType}
          deletingColumnId={null}
        />

        <DocumentFieldsDialog
          open={showFieldsDialog}
          onOpenChange={(open) => {
            setShowFieldsDialog(open);
            if (!open) fileFields.resetFields();
          }}
          activeFile={fileFields.activeFile}
          fieldsColumns={fileFields.fieldsColumns}
          fieldEdits={fileFields.fieldEdits}
          loading={fileFields.loading}
          saving={fileFields.saving}
          error={fileFields.error}
          saveMessage={fileFields.saveMessage}
          onFieldChange={fileFields.handleFieldChange}
          onSaveFields={fileFields.saveFieldChanges}
          inferColumnType={fileFields.inferColumnType}
        />

        <ShareDialog
          open={showShareDialog}
          onOpenChange={(open) => {
            setShowShareDialog(open);
            if (!open) setShareFile(null);
          }}
          shareFile={shareFile}
          onShare={handleShareFile}
        />
      </div>
    </div>
  );
}

export default FileBrowserPage;
