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

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    // Prevent body scroll when modal is open and add class
    document.body.style.overflow = 'hidden';
    document.body.classList.add('preview-modal-open');
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('preview-modal-open');
      document.removeEventListener('keydown', handleEscape);
    };
  }, [navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleOverlayClick = (e) => {
    // Close modal when clicking on the overlay (background)
    if (e.target === e.currentTarget) {
      handleGoBack();
    }
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
    <>
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
        onClick={handleOverlayClick}
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
            backgroundColor: 'white',
            borderRadius: '12px 12px 0 0'
          }}>
            <Button 
              icon={<ArrowLeft24Regular />} 
              appearance="subtle" 
              onClick={handleGoBack}
            >
              Back
            </Button>
            <h2 style={{ margin: '0 0 0 15px', fontSize: '1.2rem' }}>
              {fileDetails?.name || 'File Preview'}
            </h2>
          </div>

          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}>
                <Spinner />
                <p>Loading preview...</p>
              </div>
            ) : error ? (
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
                <p>{error}</p>
                <Button onClick={handleGoBack} appearance="primary" style={{ marginTop: '10px' }}>
                  Go Back
                </Button>
              </div>
            ) : previewUrl ? (
              <iframe 
                src={previewUrl} 
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                title="File Preview" 
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
                <Button onClick={handleGoBack} appearance="primary" style={{ marginTop: '10px' }}>
                  Go Back
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewPage;
