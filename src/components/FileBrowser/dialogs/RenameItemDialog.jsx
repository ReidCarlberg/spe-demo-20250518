import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Input,
  tokens
} from '@fluentui/react-components';

const RenameItemDialog = ({ 
  open, 
  onOpenChange, 
  onRename, 
  item = null,
  loading = false,
  error = null 
}) => {
  const [newName, setNewName] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open && item) {
      // Set the current name as default, removing extension for files
      const currentName = item.name || '';
      if (item.file && currentName.includes('.')) {
        // For files, show name without extension for editing
        const lastDotIndex = currentName.lastIndexOf('.');
        setNewName(currentName.substring(0, lastDotIndex));
      } else {
        // For folders, show full name
        setNewName(currentName);
      }
      setValidationError('');
    }
  }, [open, item]);

  const validateName = (name) => {
    if (!name || name.trim() === '') {
      return 'Name cannot be empty';
    }
    
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(name)) {
      return 'Name contains invalid characters: < > : " / \\ | ? *';
    }
    
    if (name.length > 255) {
      return 'Name is too long (maximum 255 characters)';
    }
    
    return '';
  };

  const handleNameChange = (_, data) => {
    const value = data.value;
    setNewName(value);
    setValidationError(validateName(value));
  };

  const handleSubmit = async () => {
    const trimmedName = newName.trim();
    const validation = validateName(trimmedName);
    
    if (validation) {
      setValidationError(validation);
      return;
    }

    // For files, add back the extension
    let finalName = trimmedName;
    if (item?.file && item.name?.includes('.')) {
      const extension = item.name.substring(item.name.lastIndexOf('.'));
      finalName = trimmedName + extension;
    }

    try {
      await onRename(item.id, finalName, item.name);
      handleClose();
    } catch (error) {
      // Error handled by parent component
    }
  };

  const handleClose = () => {
    setNewName('');
    setValidationError('');
    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getFileExtension = () => {
    if (item?.file && item.name?.includes('.')) {
      return item.name.substring(item.name.lastIndexOf('.'));
    }
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => {
      if (!data.open) handleClose();
    }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            Rename {item?.folder ? 'Folder' : 'File'}
          </DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 8, fontSize: 12, color: tokens.colorNeutralForeground3 }}>
              Current name: {item?.name}
            </p>

            {(validationError || error) && (
              <div 
                style={{ 
                  marginBottom: 8, 
                  color: tokens.colorPaletteRedForeground2, 
                  fontSize: 12 
                }} 
                role="alert"
              >
                {validationError || error}
              </div>
            )}

            <Input
              value={newName}
              onChange={handleNameChange}
              placeholder="Enter new name"
              autoFocus
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            {item?.file && getFileExtension() && (
              <p style={{ 
                marginTop: 4, 
                fontSize: 11, 
                color: tokens.colorNeutralForeground3 
              }}>
                Extension {getFileExtension()} will be preserved
              </p>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              appearance="primary" 
              disabled={loading || !!validationError || !newName.trim()}
              onClick={handleSubmit}
            >
              {loading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default RenameItemDialog;
