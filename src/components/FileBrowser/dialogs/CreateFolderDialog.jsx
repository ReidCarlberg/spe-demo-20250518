import React, { useState } from 'react';
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

const CreateFolderDialog = ({ open, onOpenChange, onCreateFolder }) => {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!folderName.trim()) {
      setError('Folder name required');
      return;
    }
    
    setError(null);
    setCreating(true);
    
    try {
      await onCreateFolder(folderName.trim());
      setFolderName('');
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError(null);
    setCreating(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => {
      if (!data.open) handleClose();
    }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 8 }}>
              Enter a name for the new folder
            </p>
            {error && (
              <div 
                style={{ 
                  marginBottom: 8, 
                  color: tokens.colorPaletteRedForeground2, 
                  fontSize: 12 
                }} 
                role="alert"
              >
                {error}
              </div>
            )}
            <Input 
              value={folderName} 
              onChange={(_, d) => {
                setFolderName(d.value);
                if (error) setError(null);
              }} 
              placeholder="New Folder" 
              autoFocus 
              onKeyDown={handleKeyDown}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              appearance="primary" 
              disabled={creating} 
              onClick={handleCreate}
            >
              {creating ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateFolderDialog;
