import { useState, useRef } from 'react';
import { speService } from '../../services';

export const useFileOperations = (containerId, currentFolderId, onFilesUpdated) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

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
        
        setUploadProgress((i / files.length) * 100);
        
        await speService.uploadFile(
          containerId,
          currentFolderId,
          file,
          (progress) => {
            const overallProgress = ((i + progress) / files.length) * 100;
            setUploadProgress(overallProgress);
          }
        );
      }
      
      setUploadProgress(100);
      if (onFilesUpdated) await onFilesUpdated();
    } catch (error) {
      console.error('Upload failed:', error);
      setError('File upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      return false;
    }
    
    setError(null);
    
    try {
      await speService.deleteFile(containerId, file.id);
      if (onFilesUpdated) await onFilesUpdated();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      setError(`Failed to delete file: ${error.message}`);
      return false;
    }
  };

  const createBlankFile = async (fileName) => {
    if (!fileName.trim()) {
      throw new Error('File name required');
    }
    
    setError(null);
    
    try {
      await speService.createBlankFile(containerId, currentFolderId, fileName.trim());
      if (onFilesUpdated) await onFilesUpdated();
      return true;
    } catch (error) {
      console.error('Error creating file:', error);
      setError(`Failed to create file: ${error.message}`);
      throw error;
    }
  };

  const createFolder = async (folderName) => {
    if (!folderName.trim()) {
      throw new Error('Folder name required');
    }
    
    setError(null);
    
    try {
      await speService.createFolder(containerId, currentFolderId, folderName.trim());
      if (onFilesUpdated) await onFilesUpdated();
      return true;
    } catch (error) {
      console.error('Error creating folder:', error);
      setError(`Failed to create folder: ${error.message}`);
      throw error;
    }
  };

  const renameItem = async (itemId, newName, currentName) => {
    try {
      setError(null);
      
      // Validate new name
      if (!newName || newName.trim() === '') {
        throw new Error('Item name cannot be empty');
      }
      
      if (newName === currentName) {
        return; // No change needed
      }
      
      // Check for invalid characters
      const invalidChars = /[<>:"/\\|?*]/;
      if (invalidChars.test(newName)) {
        throw new Error('Item name contains invalid characters: < > : " / \\ | ? *');
      }
      
      if (newName.length > 255) {
        throw new Error('Name is too long (maximum 255 characters)');
      }
      
      await speService.renameItem(containerId, itemId, newName.trim());
      
      // Refresh the file list
      if (onFilesUpdated) await onFilesUpdated();
      
      return true;
    } catch (error) {
      console.error('Error renaming item:', error);
      setError(`Failed to rename item: ${error.message}`);
      throw error;
    }
  };

  const getFilePreviewUrl = async (file) => {
    try {
      return await speService.getFilePreviewUrl(containerId, file.id);
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw new Error(error.message || 'Failed to load file preview');
    }
  };

  const shareFile = async (file, email, role, sendInvitation) => {
    try {
      const response = await speService.inviteFileAccess(
        containerId, 
        file.id, 
        email.trim(), 
        role, 
        { sendInvitation }
      );
      return sendInvitation ? 
        'Invitation created and email sent.' : 
        'Invitation created (email not sent).';
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error(error.message || 'Failed to share file');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // New: list versions for a file
  const listVersions = async (file) => {
    try {
      if (!file || !file.id) throw new Error('Invalid file');
      return await speService.listItemVersions(containerId, file.id);
    } catch (e) {
      console.error('Error listing versions:', e);
      throw new Error(e.message || 'Failed to fetch versions');
    }
  };

  // New: download as PDF
  const downloadAsPdf = async (file) => {
    try {
      if (!file || !file.id) throw new Error('Invalid file');
      const blob = await speService.downloadItemAsPdf(containerId, file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const base = file.name.replace(/\.[^.]+$/, '');
      a.download = `${base}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading PDF:', e);
      setError(e.message || 'Failed to download as PDF');
      throw e;
    }
  };

  return {
    isUploading,
    uploadProgress,
    error,
    fileInputRef,
    uploadFiles,
    deleteFile,
    createBlankFile,
    createFolder,
    renameItem,
    getFilePreviewUrl,
    shareFile,
    triggerFileInput,
    setError,
    // New exports
    listVersions,
    downloadAsPdf
  };
};
