import React from 'react';

const UploadProgress = ({ isUploading, progress }) => {
  if (!isUploading) return null;

  return (
    <div className="upload-progress-container">
      <div 
        className="upload-progress-bar" 
        style={{ width: `${progress}%` }} 
      />
      <div className="upload-progress-text">
        Uploading: {Math.round(progress)}%
      </div>
    </div>
  );
};

export default UploadProgress;
