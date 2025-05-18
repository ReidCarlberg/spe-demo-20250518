import { useEffect, useState } from 'react';

const PdfPreview = ({ fileUrl, fileName, onClose }) => {
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

  return (
    <div className="pdf-preview-overlay">
      <div className="pdf-preview-container">
        <div className="pdf-preview-header">
          <h3>{fileName || 'PDF Preview'}</h3>
          <button className="pdf-close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="pdf-preview-content">
          {loading && (
            <div className="pdf-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Loading PDF...</span>
            </div>
          )}
          {error && (
            <div className="pdf-error">
              <i className="fas fa-exclamation-triangle"></i>
              <span>{error}</span>
            </div>
          )}
          <iframe 
            src={fileUrl} 
            className="pdf-iframe"
            title={fileName || 'PDF Preview'}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load the PDF. Please try downloading the file instead.');
            }}
          />
        </div>
        <div className="pdf-preview-footer">
          <button className="pdf-action-button" onClick={() => window.open(fileUrl, '_blank')}>
            <i className="fas fa-external-link-alt"></i> Open in New Tab
          </button>
          <a href={fileUrl} download className="pdf-action-button pdf-download-button">
            <i className="fas fa-download"></i> Download
          </a>
          <button className="pdf-action-button pdf-close-button-text" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;
