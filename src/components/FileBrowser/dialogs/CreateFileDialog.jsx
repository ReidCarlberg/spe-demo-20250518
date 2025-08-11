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

const CreateFileDialog = ({ open, onOpenChange, onCreateFile }) => {
  const [fileName, setFileName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!fileName.trim()) {
      setError('File name required');
      return;
    }
    
    setError(null);
    setCreating(true);
    
    try {
      await onCreateFile(fileName.trim());
      setFileName('');
      onOpenChange(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setFileName('');
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
          <DialogTitle>Create blank file</DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 8 }}>
              Enter a file name ending with .docx, .xlsx, or .pptx
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
              value={fileName} 
              onChange={(_, d) => {
                setFileName(d.value);
                if (error) setError(null);
              }} 
              placeholder="QuarterlyReport.docx" 
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
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CreateFileDialog;
