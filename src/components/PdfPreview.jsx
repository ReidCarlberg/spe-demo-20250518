import { useEffect, useState } from 'react';
import { Button } from '@fluentui/react-components';
import { Dismiss24Regular, Open24Regular, ArrowDownload24Regular } from '@fluentui/react-icons';

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
          <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} aria-label="Close" className="pdf-close-button" />
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
          <Button appearance="secondary" icon={<Open24Regular />} onClick={() => window.open(fileUrl, '_blank')} className="pdf-action-button">
            Open in New Tab
          </Button>
          <Button as="a" href={fileUrl} download appearance="secondary" icon={<ArrowDownload24Regular />} className="pdf-action-button pdf-download-button">
            Download
          </Button>
          <Button appearance="primary" onClick={onClose} className="pdf-action-button pdf-close-button-text">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PdfPreview;
