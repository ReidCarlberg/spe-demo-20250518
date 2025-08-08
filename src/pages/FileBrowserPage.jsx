import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useChatFlyout } from '../hooks/useChatFlyout';
import { speService } from '../services';
import FilePreview from '../components/FilePreview';
import DriveInfoModal from '../components/DriveInfoModal';
import './FileBrowserPage.css';
import '../styles/page-one-modern.css';
// Add Fluent UI components and icons
import {
  Button,
  Spinner,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
  tokens,
  Menu, MenuTrigger, MenuPopover, MenuList, MenuItem
} from '@fluentui/react-components';
import {
  ArrowClockwise24Regular,
  ArrowUpload24Regular,
  Info24Regular,
  ArrowDownload24Regular,
  Eye24Regular,
  FolderOpen24Regular,
  Delete24Regular,
  Search24Regular,
  Dismiss24Regular,
  Document24Regular,
  MoreHorizontal24Regular
} from '@fluentui/react-icons';
// Add dialog components
import { Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions } from '@fluentui/react-components';

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
  const [driveInfo, setDriveInfo] = useState(null);
  const [showDriveInfo, setShowDriveInfo] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const searchInputRef = useRef(null);

  // Create blank file state
  const [creating, setCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFileError, setCreateFileError] = useState(null);
  const [showMetaDialog, setShowMetaDialog] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);
  const [properties, setProperties] = useState(null);
  const [propName, setPropName] = useState('');
  const [propValue, setPropValue] = useState('');
  const [propSearchable, setPropSearchable] = useState(true);
  const [addingProp, setAddingProp] = useState(false);
  // Columns (container column definitions)
  const [showColumnsDialog, setShowColumnsDialog] = useState(false);
  const [columnsLoading, setColumnsLoading] = useState(false);
  const [columnsError, setColumnsError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [colName, setColName] = useState('');
  const [colDisplayName, setColDisplayName] = useState('');
  const [colDescription, setColDescription] = useState('');
  const [colType, setColType] = useState('text');
  const [colChoices, setColChoices] = useState(''); // for choice type
  const [colMaxLength, setColMaxLength] = useState('255'); // for text type
  const [creatingColumn, setCreatingColumn] = useState(false);
  const [deletingColumnId, setDeletingColumnId] = useState(null);
  
  // Document (per-file) fields editing state
  const [showFieldsDialog, setShowFieldsDialog] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [fieldsError, setFieldsError] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [fieldsColumns, setFieldsColumns] = useState([]); // container column definitions for fields dialog
  const [fileFieldValues, setFileFieldValues] = useState({}); // original values
  const [fieldEdits, setFieldEdits] = useState({}); // draft edits
  const [savingFields, setSavingFields] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareFile, setShareFile] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState('read');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [shareMessage, setShareMessage] = useState(null);

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
      // For previewable non-Office files (e.g., PDF, images), open in preview modal
      if (isPreviewableFile(file) && !isOfficeFile(file)) {
        openPreview(file);
        return;
      }
      // Otherwise, open the source in a new tab if available
      if (file.webUrl) {
        window.open(file.webUrl, '_blank');
      }
    }
  };
  
  const handlePreviewClick = async (event, file) => {
    event.stopPropagation(); // Prevent parent click event
    await openPreview(file);
  };
  
  const openPreview = async (file) => {
    try {
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

  const handleCreateBlankFile = async () => {
    if (!newFileName.trim()) { setCreateFileError('File name required'); return; }
    setCreateFileError(null);
    try {
      await speService.createBlankFile(containerId, currentFolderId, newFileName.trim());
      setShowCreateDialog(false);
      setNewFileName('');
      await fetchFiles(currentFolderId);
    } catch (err) {
      setCreateFileError(err.message);
    } finally { setCreating(false); }
  };
  
  const openMetadata = async () => {
    if (!containerId) return;
    setShowMetaDialog(true);
    setMetaError(null);
    setMetaLoading(true);
    try {
      const props = await speService.getContainerProperties(containerId);
      setProperties(props);
    } catch (e) { setMetaError(e.message); }
    finally { setMetaLoading(false); }
  };

  const addProperty = async () => {
    if (!propName.trim()) { setMetaError('Name required'); return; }
    setMetaError(null);
    setAddingProp(true);
    try {
      await speService.addContainerProperty(containerId, propName.trim(), propValue, propSearchable);
      // Re-fetch full list to avoid losing previously loaded properties
      const refreshed = await speService.getContainerProperties(containerId);
      setProperties(refreshed);
      setPropName(''); setPropValue(''); setPropSearchable(true);
    } catch (e) { setMetaError(e.message); }
    finally { setAddingProp(false); }
  };

  // Container Columns handlers
  const openColumns = async () => {
    if (!containerId) return;
    setShowColumnsDialog(true);
    setColumnsError(null);
    setColumns([]);
    setColumnsLoading(true);
    try {
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
    } catch (e) { setColumnsError(e.message); }
    finally { setColumnsLoading(false); }
  };

  const inferColumnType = (col) => {
    if (!col) return 'unknown';
    const known = ['text','choice','boolean','dateTime','currency','number','personOrGroup','hyperlinkOrPicture'];
    return known.find(k => col[k]) || 'unknown';
  };

  const resetColumnForm = () => {
    setColName(''); setColDisplayName(''); setColDescription(''); setColType('text'); setColChoices(''); setColMaxLength('255');
  };

  const createColumn = async () => {
    if (!colName.trim()) { setColumnsError('Column name required'); return; }
    setColumnsError(null);
    setCreatingColumn(true);
    try {
      const payload = {
        name: colName.trim(),
        displayName: colDisplayName.trim() || colName.trim(),
        description: colDescription.trim(),
        enforceUniqueValues: false,
        hidden: false,
        indexed: false
      };
      switch(colType){
        case 'text':
          payload.text = { maxLength: parseInt(colMaxLength)||255, allowMultipleLines:false, appendChangesToExistingText:false, linesForEditing:0 }; break;
        case 'choice':
          payload.choice = { allowTextEntry:false, displayAs:'dropDownMenu', choices: colChoices.split(',').map(c=>c.trim()).filter(Boolean) }; break;
        case 'boolean': payload.boolean = {}; break;
        case 'number': payload.number = { decimalPlaces:'automatic' }; break;
        case 'dateTime': payload.dateTime = { displayAs:'default', format:'dateOnly' }; break;
        default: payload.text = { maxLength:255, allowMultipleLines:false, appendChangesToExistingText:false, linesForEditing:0 }; break;
      }
      await speService.createContainerColumn(containerId, payload);
      // refresh list
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
      resetColumnForm();
    } catch(e){ setColumnsError(e.message); }
    finally { setCreatingColumn(false); }
  };

  const deleteColumn = async (col) => {
    if (!window.confirm(`Delete column ${col.displayName || col.name}?`)) return;
    setDeletingColumnId(col.id);
    try {
      await speService.deleteContainerColumn(containerId, col.id);
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
    } catch(e){ setColumnsError(e.message); }
    finally { setDeletingColumnId(null); }
  };
  
  // Open per-file fields editing dialog
  const openFieldsDialog = async (file) => {
    if (!containerId || !file || file.folder) return;
    setActiveFile(file);
    setShowFieldsDialog(true);
    setFieldsLoading(true);
    setFieldsError(null);
    setSaveMessage(null);
    try {
      const [cols, fields] = await Promise.all([
        speService.listContainerColumns(containerId),
        speService.getFileFields(containerId, file.id)
      ]);
      setFieldsColumns(cols);
      setFileFieldValues(fields);
      setFieldEdits(fields);
    } catch(e){ setFieldsError(e.message); }
    finally { setFieldsLoading(false); }
  };

  const closeFieldsDialog = () => {
    setShowFieldsDialog(false);
    setActiveFile(null);
    setFieldsColumns([]);
    setFileFieldValues({});
    setFieldEdits({});
    setFieldsError(null);
    setSaveMessage(null);
    setSavingFields(false);
  };

  const handleFieldChange = (fieldName, value) => {
    setFieldEdits(prev => ({ ...prev, [fieldName]: value }));
  };

  const saveFieldChanges = async () => {
    if (!activeFile) return;
    setSavingFields(true);
    setFieldsError(null);
    setSaveMessage(null);
    try {
      const diffEntries = Object.entries(fieldEdits).filter(([k,v]) => fileFieldValues[k] !== v);
      for (const [name, val] of diffEntries) {
        await speService.updateFileField(containerId, activeFile.id, name, val);
      }
      setFileFieldValues(fieldEdits);
      setSaveMessage(diffEntries.length ? 'Fields saved successfully.' : 'No changes to save.');
      // Optionally refresh files list to show any column-bound fields changes in list (future enhancement)
    } catch(e){ setFieldsError(e.message); }
    finally { setSavingFields(false); }
  };

  // Added: search handlers
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const term = searchTerm.trim();
    if (!term) { setSearchResults(null); return; }
    setIsSearching(true); setError(null);
    try {
      const results = await speService.searchFiles(containerId, term, 100);
      setSearchResults(results || []);
    } catch(err){ setError('Search failed: ' + err.message); }
    finally { setIsSearching(false); }
  };
  const clearSearch = () => { setSearchResults(null); setSearchTerm(''); };

  // Added: drive info handlers
  const handleDriveInfoClick = async () => {
    try {
      const info = await speService.getDriveInfo(containerId);
      setDriveInfo(info); setShowDriveInfo(true);
    } catch(err){ setError('Failed to load drive info: ' + err.message); }
  };
  const closeDriveInfo = () => { setShowDriveInfo(false); };

  // Added: share placeholder
  const handleSharePlaceholder = (file) => {
    console.log('Share action placeholder for', file?.name);
    alert('Share functionality not implemented yet.');
  };
  // Replace placeholder with real openShareDialog
  const openShareDialog = (file) => {
    setShareFile(file); setShareEmail(''); setShareRole('read'); setShareError(null); setShareMessage(null); setShowShareDialog(true);
  };
  const closeShareDialog = () => { setShowShareDialog(false); setShareFile(null); };
  const submitShare = async () => {
    if (!shareEmail.trim()) { setShareError('Email required'); return; }
    setShareError(null); setShareMessage(null); setSharing(true);
    try {
      const resp = await speService.inviteFileAccess(containerId, shareFile.id, shareEmail.trim(), shareRole);
      setShareMessage('Invitation created. (sendInvitation=false)');
    } catch(e){ setShareError(e.message); }
    finally { setSharing(false); }
  };

  // If still loading or not authenticated, show loading
  if (loading || !isAuthenticated) {
    return (
      <div className="file-browser-loading">
        <p>Loading file browser...</p>
      </div>
    );
  }

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

        {error && (
          <div className="file-browser-error">
            <p>{error}</p>
          </div>
        )}

        {/* Breadcrumb Path */}
        <div className="file-browser-path">
          <nav className="fb-breadcrumb" aria-label="Breadcrumb">
            {currentPath.map((pathItem, index) => {
              const isLast = index === currentPath.length - 1;
              return (
                <React.Fragment key={index}>
                  {index > 0 && <span className="fb-sep">›</span>}
                  {isLast ? (
                    <span className="fb-current" aria-current="page">{pathItem.name}</span>
                  ) : (
                    <button
                      type="button"
                      className="fb-link"
                      onClick={() => handlePathClick(pathItem, index)}
                    >
                      {pathItem.name}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Toolbar: search + actions */}
        <div className="po-search-area" style={{ marginTop: 12 }}>
          <div className="po-toolbar">
            <Input
              size="large"
              placeholder="Search files in this folder…"
              value={searchTerm}
              onChange={(_, data) => setSearchTerm(data.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(e);
                }
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button appearance="primary" size="large" icon={<Search24Regular />} onClick={handleSearch}>
                Search
              </Button>
              {searchResults && (
                <Button appearance="secondary" size="large" icon={<Dismiss24Regular />} onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {/* Reworked toolbar layout: left group actions + right aligned More menu */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', flexGrow:1 }}>
              <Button icon={<ArrowClockwise24Regular />} onClick={() => fetchFiles(currentFolderId)} disabled={isLoading}>
                {isLoading ? 'Loading…' : 'Refresh'}
              </Button>
              <Button icon={<ArrowUpload24Regular />} onClick={triggerFileInput} disabled={isUploading}>
                {isUploading ? 'Uploading…' : 'Upload Files'}
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={(_, data) => { setShowCreateDialog(!!data.open); if (!data.open) { setNewFileName(''); setCreateFileError(null); } }}>
                <DialogTrigger disableButtonEnhancement>
                  <Button icon={<Document24Regular />} onClick={() => setShowCreateDialog(true)}>New Office File</Button>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogTitle>Create blank file</DialogTitle>
                    <DialogContent>
                      <p style={{ marginBottom: 8 }}>Enter a file name ending with .docx, .xlsx, or .pptx</p>
                      {createFileError && (
                        <div style={{ marginBottom: 8, color: tokens.colorPaletteRedForeground2, fontSize: 12 }} role="alert">
                          {createFileError}
                        </div>
                      )}
                      <Input value={newFileName} onChange={(_, d) => { setNewFileName(d.value); if (createFileError) setCreateFileError(null); }} placeholder="QuarterlyReport.docx" autoFocus onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateBlankFile(); } }} />
                    </DialogContent>
                    <DialogActions>
                      <Button appearance="secondary" onClick={() => { setShowCreateDialog(false); setNewFileName(''); setCreateFileError(null); }}>Cancel</Button>
                      <Button appearance="primary" disabled={creating} onClick={handleCreateBlankFile}>{creating ? 'Creating...' : 'Create'}</Button>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>
              <Button onClick={() => navigate('/spe-explore')}>
                Back to Containers
              </Button>
            </div>
            <div style={{ marginLeft:'auto' }}>
              <Menu positioning="below-end">
                <MenuTrigger disableButtonEnhancement>
                  <Button icon={<MoreHorizontal24Regular />}>More</Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem icon={<Info24Regular />} onClick={handleDriveInfoClick} disabled={isLoading}>Drive Info</MenuItem>
                    <MenuItem onClick={openMetadata}>Container Properties</MenuItem>
                    <MenuItem onClick={() => { openColumns(); }}>Container Columns</MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              multiple
            />
          </div>
        </div>

        {isUploading && (
          <div className="upload-progress-container">
            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
            <div className="upload-progress-text">Uploading: {Math.round(uploadProgress)}%</div>
          </div>
        )}

        {/* Files Table */}
        <div className="files-section" style={{ marginTop: 12 }}>
          {isSearching ? (
            <p className="loading-text">Searching files...</p>
          ) : isLoading ? (
            <p className="loading-text">Loading files...</p>
          ) : (searchResults ? (Array.isArray(searchResults) && searchResults.length === 0) : (files.length === 0)) ? (
            <div className="empty-state drop-zone" onDragOver={handleDragOver} onDrop={handleDrop} style={{ padding:40, border:'2px dashed #bbb', textAlign:'center', borderRadius:8 }}>
              <p style={{ fontSize:16, marginBottom:8 }}>No files here yet.</p>
              <p style={{ fontSize:13, color:'#666', marginBottom:16 }}>Drag & drop files to upload or use the Upload / New buttons.</p>
              <Button appearance="primary" onClick={triggerFileInput}>Upload Files</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell className="col-name" style={{ width: '56%' }}>Name</TableHeaderCell>
                  <TableHeaderCell className="col-modified" style={{ width: '22%' }}>Modified</TableHeaderCell>
                  <TableHeaderCell className="col-size" style={{ width: '12%', textAlign: 'right' }}>Size</TableHeaderCell>
                  <TableHeaderCell className="col-actions" style={{ width: '10%', textAlign: 'right' }}>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(searchResults || files).map((file) => {
                  const fileType = file.folder ? 'folder' : getFileTypeFromMime(file.file?.mimeType, file.name);
                  const sizeLabel = !file.folder && file.size ? `${Math.round(file.size / 1024)} KB` : (file.folder ? `${file.folder.childCount ?? ''} ${file.folder.childCount === 1 ? 'item' : 'items'}` : '');
                  const modified = file.lastModifiedDateTime ? new Date(file.lastModifiedDateTime).toLocaleString() : '';
                  const previewable = !file.folder && isPreviewableFile(file) && !isOfficeFile(file);
                  return (
                    <TableRow key={file.id}>
                      <TableCell className="col-name">
                        <Button
                          appearance="transparent"
                          onClick={() => (file.folder ? navigateToFolder(file) : handleFileClick(file))}
                          className="item-link item-button"
                          aria-label={file.folder ? `Open folder ${file.name}` : `Open ${file.name}`}
                          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                        >
                          {file.folder ? <FolderOpen24Regular /> : <Document24Regular />} <span className="item-text">{file.name}</span>
                        </Button>
                      </TableCell>
                      <TableCell className="col-modified">{modified}</TableCell>
                      <TableCell className="col-size" style={{ textAlign: 'right' }}>{sizeLabel}</TableCell>
                      <TableCell className="col-actions" style={{ textAlign: 'right' }}>
                        {/* Inline action buttons for files */}
                        {!file.folder && (
                          <div style={{ display:'inline-flex', gap:4, alignItems:'center', marginRight:4 }}>
                            {previewable && (
                              <Button appearance="subtle" icon={<Eye24Regular />} aria-label="Preview" onClick={(e)=>{ e.stopPropagation(); handlePreviewClick(e,file); }} />
                            )}
                            <Button appearance="subtle" icon={<ArrowDownload24Regular />} aria-label="Download" onClick={(e)=>{ e.stopPropagation(); handleDownloadClick(e,file); }} />
                          </div>
                        )}
                        <Menu positioning="below-end">
                          <MenuTrigger disableButtonEnhancement>
                            <Button appearance="subtle" icon={<MoreHorizontal24Regular />} aria-label="More actions" />
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              {file.folder ? (
                                <>
                                  <MenuItem onClick={(e)=>{ e.stopPropagation(); navigateToFolder(file); }}>Open</MenuItem>
                                  <MenuItem onClick={(e)=>{ e.stopPropagation(); handleDeleteFile(e, file); }}>Delete</MenuItem>
                                </>
                              ) : (
                                <>
                                  <MenuItem onClick={(e)=>{ e.stopPropagation(); openFieldsDialog(file); }}>Edit Document Fields</MenuItem>
                                  <MenuItem onClick={(e)=>{ e.stopPropagation(); handleDeleteFile(e,file); }}>Delete</MenuItem>
                                  <MenuItem onClick={(e)=>{ e.stopPropagation(); openShareDialog(file); }}>Share</MenuItem>
                                </>
                              )}
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Document Preview Modal */}
        {previewFile && (
          <FilePreview fileUrl={previewFile.url} fileName={previewFile.name} onClose={closePreview} />
        )}

        {/* Drive Info Modal */}
        {showDriveInfo && (
          <DriveInfoModal driveInfo={driveInfo} onClose={closeDriveInfo} />
        )}

        {/* Metadata Dialog */}
        <Dialog open={showMetaDialog} onOpenChange={(_,d)=>{ setShowMetaDialog(!!d.open); if(!d.open){ setProperties(null); setMetaError(null);} }}>
          <DialogSurface style={{ maxWidth: 640 }}>
            <DialogBody>
              <DialogTitle>Container Properties</DialogTitle>
              <DialogContent>
                {metaLoading && <p>Loading properties...</p>}
                {metaError && <p style={{ color: 'crimson', fontSize: 12 }} role="alert">{metaError}</p>}
                {!metaLoading && properties && (
                  <div style={{ marginBottom:16 }}>
                    {Object.keys(properties).filter(k=>!k.startsWith('@')).length === 0 && <p style={{ fontStyle:'italic' }}>No properties set.</p>}
                    {Object.entries(properties)
                      .filter(([k]) => !k.startsWith('@'))
                      .map(([k,v]) => (
                        <div key={k} style={{ padding:'6px 8px', border:'1px solid #ddd', borderRadius:6, marginBottom:6 }}>
                          <strong>{k}</strong>: <span>{v?.value ?? ''}</span>{v?.isSearchable ? <span style={{ marginLeft:8, fontSize:11, background:'#eef', padding:'2px 6px', borderRadius:12 }}>searchable</span>:null}
                        </div>
                    ))}
                  </div>
                )}
                <div style={{ borderTop:'1px solid #e1e4e8', paddingTop:12, marginTop:8 }}>
                  <h4 style={{ margin:'4px 0 8px' }}>Add Property</h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <Input size="small" value={propName} placeholder="Property name" onChange={(_,d)=>setPropName(d.value)} />
                    <Input size="small" value={propValue} placeholder="Property value" onChange={(_,d)=>setPropValue(d.value)} />
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:12 }}>
                      <input type="checkbox" checked={propSearchable} onChange={e=>setPropSearchable(e.target.checked)} /> Searchable
                    </label>
                    <div style={{ display:'flex', gap:8 }}>
                      <Button appearance="primary" size="small" disabled={addingProp} onClick={addProperty}>{addingProp? 'Adding...' : 'Add'}</Button>
                      <Button size="small" appearance="secondary" onClick={()=>{ setPropName(''); setPropValue(''); setPropSearchable(true);}}>Reset</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={()=>setShowMetaDialog(false)}>Close</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Container Columns Dialog */}
        <Dialog open={showColumnsDialog} onOpenChange={(_,d)=>{ setShowColumnsDialog(!!d.open); if(!d.open){ setColumns([]); setColumnsError(null); } }}>
          <DialogSurface style={{ maxWidth: 760 }}>
            <DialogBody>
              <DialogTitle>Container Columns</DialogTitle>
              <DialogContent>
                {columnsLoading && <p>Loading columns...</p>}
                {columnsError && <p style={{ color:'crimson', fontSize:12 }} role="alert">{columnsError}</p>}
                {!columnsLoading && !columnsError && columns.length === 0 && <p style={{ fontStyle:'italic' }}>No columns defined.</p>}
                {!columnsLoading && columns.length > 0 && (
                  <div style={{ marginBottom:16 }}>
                    {columns.map(col => (
                      <div key={col.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', border:'1px solid #ddd', padding:'6px 10px', borderRadius:6, marginBottom:6 }}>
                        <div>
                          <strong>{col.displayName || col.name}</strong> <span style={{ fontSize:11, background:'#eef', padding:'2px 6px', borderRadius:12, marginLeft:4 }}>{inferColumnType(col)}</span>
                          {col.description && <div style={{ fontSize:11, color:'#555', marginTop:2 }}>{col.description}</div>}
                        </div>
                        <div>
                          <Button appearance="subtle" size="small" disabled={deletingColumnId===col.id} onClick={()=>deleteColumn(col)}>{deletingColumnId===col.id ? 'Deleting…' : 'Delete'}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ borderTop:'1px solid #e1e4e8', paddingTop:12 }}>
                  <h4 style={{ margin:'4px 0 8px' }}>Add Column</h4>
                  <div style={{ display:'grid', gap:8, gridTemplateColumns:'1fr 1fr', marginBottom:8 }}>
                    <Input size="small" value={colName} placeholder="Name *" onChange={(_,d)=>setColName(d.value)} />
                    <Input size="small" value={colDisplayName} placeholder="Display name" onChange={(_,d)=>setColDisplayName(d.value)} />
                    <Input size="small" value={colDescription} placeholder="Description" onChange={(_,d)=>setColDescription(d.value)} />
                    <select value={colType} onChange={e=>setColType(e.target.value)} style={{ fontSize:12, padding:6, borderRadius:4, border:'1px solid #ccc' }}>
                      <option value="text">Text</option>
                      <option value="choice">Choice</option>
                      <option value="boolean">Boolean</option>
                      <option value="number">Number</option>
                      <option value="dateTime">Date/Time</option>
                    </select>
                  </div>
                  {colType === 'text' && (
                    <div style={{ marginBottom:8 }}>
                      <Input size="small" value={colMaxLength} placeholder="Max length" onChange={(_,d)=>setColMaxLength(d.value)} />
                    </div>
                  )}
                  {colType === 'choice' && (
                    <div style={{ marginBottom:8 }}>
                      <Input size="small" value={colChoices} placeholder="Choices (comma separated)" onChange={(_,d)=>setColChoices(d.value)} />
                    </div>
                  )}
                  <div style={{ display:'flex', gap:8 }}>
                    <Button appearance="primary" size="small" disabled={creatingColumn} onClick={createColumn}>{creatingColumn ? 'Creating…' : 'Create Column'}</Button>
                    <Button size="small" appearance="secondary" onClick={resetColumnForm}>Reset</Button>
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={()=>setShowColumnsDialog(false)}>Close</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Document Fields Dialog */}
        <Dialog open={showFieldsDialog} onOpenChange={(_,d)=>{ if(!d.open) closeFieldsDialog(); }}>
          <DialogSurface style={{ maxWidth: 720 }}>
            <DialogBody>
              <DialogTitle>Edit Document Fields{activeFile? ` – ${activeFile.name}`:''}</DialogTitle>
              <DialogContent>
                {fieldsLoading && <p>Loading fields...</p>}
                {fieldsError && <p style={{ color:'crimson', fontSize:12 }} role="alert">{fieldsError}</p>}
                {!fieldsLoading && !fieldsError && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {fieldsColumns.length === 0 && <p style={{ fontStyle:'italic' }}>No columns defined for this container.</p>}
                    {fieldsColumns.map(col => {
                      const type = inferColumnType(col);
                      const name = col.name;
                      let value = fieldEdits[name];
                      const onChange = (val) => handleFieldChange(name, val);
                      return (
                        <div key={col.id} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                          <label style={{ fontWeight:600, fontSize:13 }}>{col.displayName || name}</label>
                          {type === 'choice' && col.choice?.choices ? (
                            <select value={value ?? ''} onChange={e=>onChange(e.target.value)} style={{ padding:6, fontSize:13, borderRadius:4, border:'1px solid #ccc' }}>
                              <option value="">-- Select --</option>
                              {col.choice.choices.map(c=> <option key={c} value={c}>{c}</option>)}
                            </select>
                          ) : type === 'boolean' ? (
                            <label style={{ display:'flex', alignItems:'center', gap:6 }}>
                              <input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)} />
                              <span style={{ fontSize:12 }}>True / False</span>
                            </label>
                          ) : type === 'number' ? (
                            <Input type="number" value={value ?? ''} onChange={(_,d)=>onChange(d.value === '' ? '' : Number(d.value))} />
                          ) : type === 'dateTime' ? (
                            <Input type="datetime-local" value={value ? new Date(value).toISOString().slice(0,16) : ''} onChange={(_,d)=>{ const iso = d.value ? new Date(d.value).toISOString() : ''; onChange(iso); }} />
                          ) : (
                            <Input value={value ?? ''} onChange={(_,d)=>onChange(d.value)} />
                          )}
                          {col.description && <div style={{ fontSize:11, color:'#666' }}>{col.description}</div>}
                        </div>
                      );
                    })}
                    {saveMessage && <div style={{ fontSize:12, color:'green' }}>{saveMessage}</div>}
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={closeFieldsDialog}>Close</Button>
                <Button appearance="primary" disabled={savingFields || fieldsLoading} onClick={saveFieldChanges}>{savingFields ? 'Saving…' : 'Save Changes'}</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={(_,d)=>{ if(!d.open) closeShareDialog(); }}>
          <DialogSurface style={{ maxWidth:480 }}>
            <DialogBody>
              <DialogTitle>Share File{shareFile? ` – ${shareFile.name}`:''}</DialogTitle>
              <DialogContent>
                {shareError && <p style={{ color:'crimson', fontSize:12 }} role="alert">{shareError}</p>}
                {shareMessage && <p style={{ color:'green', fontSize:12 }} role="status">{shareMessage}</p>}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <Input value={shareEmail} placeholder="Recipient email" onChange={(_,d)=>{ setShareEmail(d.value); if(shareError) setShareError(null); }} />
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <label style={{ fontSize:13, fontWeight:600 }}>Role:</label>
                    <select value={shareRole} onChange={e=>setShareRole(e.target.value)} style={{ padding:6, fontSize:13, borderRadius:4, border:'1px solid #ccc' }}>
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                    </select>
                  </div>
                  <div style={{ fontSize:11, color:'#666' }}>Creates an invite granting the selected role. Invitations are not emailed (sendInvitation=false).</div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={closeShareDialog}>Close</Button>
                <Button appearance="primary" disabled={sharing} onClick={submitShare}>{sharing? 'Sharing…':'Share'}</Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </div>
  );
};

export default FileBrowserPage;
