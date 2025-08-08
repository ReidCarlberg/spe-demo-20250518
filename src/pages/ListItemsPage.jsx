import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speService } from '../services';
import { 
  Button, 
  Spinner, 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton
} from '@fluentui/react-components';
import { 
  ArrowLeft24Regular, 
  Document24Regular, 
  Folder24Regular,
  Image24Regular 
} from '@fluentui/react-icons';
import FilePreview from '../components/FilePreview';
import '../styles/page-one-modern.css';
import './ListItemsPage.css';

const ListItemsPage = () => {
  const { driveId, folderId = 'root' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [folderDetails, setFolderDetails] = useState(null);
  const [error, setError] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Preview modal state
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get folder items
        const folderItems = await speService.listFiles(driveId, folderId);
        setItems(folderItems);

        // Get folder details (except for root)
        if (folderId !== 'root') {
          const details = await speService.getFileDetails(driveId, folderId);
          setFolderDetails(details);
          await buildBreadcrumbs(details);
        } else {
          // For root, just set a simple breadcrumb
          setBreadcrumbs([{ id: 'root', name: 'Root', isRoot: true }]);
        }
      } catch (err) {
        console.error('Error loading folder items:', err);
        setError(err.message || 'Failed to load folder items');
      } finally {
        setLoading(false);
      }
    };

    const buildBreadcrumbs = async (folderDetails) => {
      // Start with current folder
      const crumbs = [{ id: folderDetails.id, name: folderDetails.name }];
      
      // Add parent folders
      let current = folderDetails;
      while (current.parentReference && current.parentReference.id !== driveId) {
        try {
          const parent = await speService.getFileDetails(
            driveId, 
            current.parentReference.id
          );
          crumbs.unshift({ id: parent.id, name: parent.name });
          current = parent;
        } catch (err) {
          console.error('Error building breadcrumbs:', err);
          break;
        }
      }
      
      // Add root
      crumbs.unshift({ id: 'root', name: 'Root', isRoot: true });
      
      setBreadcrumbs(crumbs);
    };

    if (driveId) {
      loadItems();
    } else {
      setError('Invalid drive ID');
      setLoading(false);
    }
  }, [driveId, folderId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const getFileIcon = (item) => {
    if (item.folder) {
      return <Folder24Regular />;
    }
      const extension = item.name.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) {
      return <Document24Regular style={{ color: '#E74C3C' }} />; // Using Document icon with red color for PDF
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return <Image24Regular />;
    }
    
    return <Document24Regular />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatSize = (sizeInBytes) => {
    if (!sizeInBytes) return '';
    
    const kilobyte = 1024;
    const megabyte = kilobyte * 1024;
    const gigabyte = megabyte * 1024;
    
    if (sizeInBytes < kilobyte) {
      return sizeInBytes + ' B';
    } else if (sizeInBytes < megabyte) {
      return (sizeInBytes / kilobyte).toFixed(1) + ' KB';
    } else if (sizeInBytes < gigabyte) {
      return (sizeInBytes / megabyte).toFixed(1) + ' MB';
    } else {
      return (sizeInBytes / gigabyte).toFixed(1) + ' GB';
    }
  };

  const handleFileClick = async (item) => {
    if (item.folder) {
      // Navigate to folder
      navigate(`/list/${driveId}/${item.id}`);
    } else {
      // Show preview modal
      setPreviewFile(item);
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewUrl(null);
      
      try {
        const url = await speService.getFilePreviewUrl(driveId, item.id);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Error loading preview:', err);
        setPreviewError(err.message || 'Failed to load file preview');
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(false);
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

  return (
    <div className="list-items-page page-one-modern">
      <div className="list-items-header">
        <Button 
          icon={<ArrowLeft24Regular />} 
          appearance="subtle" 
          onClick={handleGoBack}
        >
          Back
        </Button>
        <h2>{folderDetails?.name || 'Root Folder'}</h2>
      </div>

      <div className="breadcrumb-container">
        <Breadcrumb>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <BreadcrumbDivider />}
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <span>{crumb.name}</span>
                ) : (
                  <BreadcrumbButton onClick={() => navigate(`/list/${driveId}/${crumb.isRoot ? 'root' : crumb.id}`)}>
                    {crumb.name}
                  </BreadcrumbButton>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </Breadcrumb>
      </div>

      <div className="list-items-container">
        {loading ? (
          <div className="list-items-loading">
            <Spinner />
            <p>Loading items...</p>
          </div>
        ) : error ? (
          <div className="list-items-error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="list-items-empty">
            <p>This folder is empty.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Modified</TableHeaderCell>
                <TableHeaderCell>Size</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.folder ? (
                      <BreadcrumbButton onClick={() => navigate(`/list/${driveId}/${item.id}`)} className="item-link">
                        {getFileIcon(item)} {item.name}
                      </BreadcrumbButton>
                    ) : (
                      <Button appearance="transparent" onClick={() => handleFileClick(item)} className="item-link item-button" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getFileIcon(item)} {item.name}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(item.lastModifiedDateTime)}</TableCell>
                  <TableCell>{item.folder ? `${item.folder.childCount} items` : formatSize(item.size)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Unified Preview Modal */}
      {previewFile && (
        <FilePreview 
          fileUrl={previewUrl}
          fileName={previewFile?.name}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default ListItemsPage;
