import { useEffect, useState } from 'react';
import '../styles/file-preview.css';

const FilePreview = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set up any initialization here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [fileUrl]);

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
    <div className="file-preview-overlay">
      <div className="file-preview-container">
        <div className="file-preview-header">
          <h3>{fileName || 'File Preview'}</h3>
          <button className="file-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
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
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(`Failed to load the ${fileType}. Please try downloading the file instead.`);
            }}
          />
        </div>
        <div className="file-preview-footer">
          <button className="file-action-button" onClick={() => window.open(fileUrl, '_blank')}>
            <i className="fas fa-external-link-alt"></i> Open in New Tab
          </button>          <a href={fileUrl} download className="file-action-button file-download-button">
            <i className="fas fa-download"></i> Download
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


