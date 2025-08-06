import { useEffect, useState } from 'react';
import '../styles/file-preview.css';

const FilePreview = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('FilePreview received fileUrl:', fileUrl); // Debug log
    console.log('FilePreview received fileName:', fileName); // Debug log
    
    // Set up any initialization here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [fileUrl, onClose]);

  // Determine file type for specific handling
  const getFileType = () => {
    if (!fileName) return 'unknown';
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'image';
    return 'document';
  };

  const fileType = getFileType();

  return (
    <div 
      className="file-preview-overlay"
      onClick={(e) => {
        // Close modal when clicking on the overlay (background)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="file-preview-container">
        <div className="file-preview-header">
          <h3>{fileName || 'File Preview'}</h3>
          <button className="file-close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="file-preview-content">
          {loading && (
            <div className="file-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading {fileType}...</span>
            </div>
          )}
          {error && (
            <div className="file-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
          <iframe 
            src={fileUrl} 
            className="file-iframe"
            title={fileName || 'File Preview'}
            onLoad={() => {
              console.log('Iframe loaded successfully'); // Debug log
              setLoading(false);
            }}
            onError={(e) => {
              console.error('Iframe failed to load:', e); // Debug log
              setLoading(false);
              setError(`Failed to load the ${fileType}. Please try downloading the file instead.`);
            }}
            style={{
              display: loading ? 'none' : 'block'
            }}
            allow="same-origin"
          />
        </div>
        <div className="file-preview-footer">
          <button className="file-action-button" onClick={() => window.open(fileUrl, '_blank')}>
            <i className="fas fa-external-link-alt"></i>
            Open in New Tab
          </button>
          <a href={fileUrl} download className="file-action-button file-download-button">
            <i className="fas fa-download"></i>
            Download
          </a>
          <button className="file-action-button file-close-button-text" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;


