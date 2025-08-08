import { useEffect, useState } from 'react';
import { Button } from '@fluentui/react-components';
import { Dismiss24Regular, Open24Regular, ArrowDownload24Regular } from '@fluentui/react-icons';
import '../styles/file-preview.css';
import '../styles/page-one-modern.css';

const FilePreview = ({ fileUrl, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('FilePreview received fileUrl:', fileUrl); // Debug log
    console.log('FilePreview received fileName:', fileName); // Debug log
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [fileUrl, onClose]);

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
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="file-preview-container">
        <div className="file-preview-header">
          <h3>{fileName || 'File Preview'}</h3>
          <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} aria-label="Close preview" />
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
              console.log('Iframe loaded successfully');
              setLoading(false);
            }}
            onError={(e) => {
              console.error('Iframe failed to load:', e);
              setLoading(false);
              setError(`Failed to load the ${fileType}. Please try downloading the file instead.`);
            }}
            style={{ display: loading ? 'none' : 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
        <div className="file-preview-footer">
          <Button appearance="secondary" icon={<Open24Regular />} onClick={() => window.open(fileUrl, '_blank')}>
            Open in New Tab
          </Button>
          <Button as="a" href={fileUrl} download appearance="secondary" icon={<ArrowDownload24Regular />}>
            Download
          </Button>
          <Button appearance="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilePreview;


