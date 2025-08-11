import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogSurface, 
  DialogBody, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Input
} from '@fluentui/react-components';

const EditColumnDialog = ({ column, open, onOpenChange, onUpdateColumn }) => {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (column) {
      setDisplayName(column.displayName || column.name || '');
      setDescription(column.description || '');
      setError(null);
    }
  }, [column]);

  const handleSubmit = async () => {
    if (!column) return;
    
    setError(null);
    setLoading(true);
    
    try {
      await onUpdateColumn(column.id, {
        displayName,
        description
      });
      onOpenChange(false);
    } catch (err) {
      setError(err.message || 'Failed to update column');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => {
      if (!d.open) handleClose();
    }}>
      <DialogSurface style={{ maxWidth: 480 }}>
        <DialogBody>
          <DialogTitle>
            Edit Column{column ? ` – ${column.displayName || column.name}` : ''}
          </DialogTitle>
          <DialogContent>
            {error && (
              <p style={{ color: 'crimson', fontSize: 12 }} role="alert">
                {error}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Display Name</label>
              <Input 
                value={displayName} 
                onChange={(_, d) => setDisplayName(d.value)} 
                placeholder="Display name" 
              />
              <label style={{ fontSize: 13, fontWeight: 600 }}>Description</label>
              <Input 
                value={description} 
                onChange={(_, d) => setDescription(d.value)} 
                placeholder="Description" 
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              appearance="primary" 
              disabled={loading} 
              onClick={handleSubmit}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default EditColumnDialog;
