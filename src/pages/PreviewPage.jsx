import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { speService } from '../services';
import { Button, Spinner } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import '../styles/file-preview.css';
import './PreviewPage.css';

const PreviewPage = () => {
  const { driveId, itemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get file details 
        const details = await speService.getFileDetails(driveId, itemId);
        setFileDetails(details);
        
        // Get preview URL
        const url = await speService.getFilePreviewUrl(driveId, itemId);
        setPreviewUrl(url);
      } catch (err) {
        console.error('Error loading preview:', err);
        setError(err.message || 'Failed to load file preview');
      } finally {
        setLoading(false);
      }
    };

    if (driveId && itemId) {
      loadPreview();
    } else {
      setError('Invalid file parameters');
      setLoading(false);
    }
  }, [driveId, itemId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  // Determine file type for better UI experience
  const getFileType = () => {
    if (!fileDetails?.name) return 'unknown';
    
    const extension = fileDetails.name.split('.').pop().toLowerCase();
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) return 'image';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    return 'document';
  };

  return (
    <div className="preview-page">
      <div className="preview-header">
        <Button 
          icon={<ArrowLeft24Regular />} 
          appearance="subtle" 
          onClick={handleGoBack}
        >
          Back
        </Button>
        <h2>{fileDetails?.name || 'File Preview'}</h2>
      </div>

      <div className="preview-container">
        {loading ? (
          <div className="preview-loading">
            <Spinner />
            <p>Loading preview...</p>
          </div>
        ) : error ? (
          <div className="preview-error">
            <h3>Error Loading Preview</h3>
            <p>{error}</p>
          </div>
        ) : previewUrl ? (
          <iframe 
            src={previewUrl} 
            className="preview-frame" 
            title="File Preview" 
            sandbox="allow-scripts allow-same-origin allow-forms" 
          />
        ) : (
          <div className="preview-error">
            <h3>Preview Not Available</h3>
            <p>This file type cannot be previewed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPage;
