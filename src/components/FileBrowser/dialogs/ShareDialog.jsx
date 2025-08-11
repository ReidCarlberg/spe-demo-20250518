import React, { useState } from 'react';
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

const ShareDialog = ({ open, onOpenChange, shareFile, onShare }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('read');
  const [sendInvitation, setSendInvitation] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Email required');
      return;
    }
    
    setError(null);
    setMessage(null);
    setSharing(true);
    
    try {
      const result = await onShare(shareFile, email.trim(), role, sendInvitation);
      setMessage(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setRole('read');
    setSendInvitation(false);
    setError(null);
    setMessage(null);
    setSharing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => {
      if (!d.open) handleClose();
    }}>
      <DialogSurface style={{ maxWidth: 480 }}>
        <DialogBody>
          <DialogTitle>
            Share File{shareFile ? ` – ${shareFile.name}` : ''}
          </DialogTitle>
          <DialogContent>
            {error && (
              <p style={{ color: 'crimson', fontSize: 12 }} role="alert">
                {error}
              </p>
            )}
            {message && (
              <p style={{ color: 'green', fontSize: 12 }} role="status">
                {message}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Input 
                value={email} 
                placeholder="Recipient email" 
                onChange={(_, d) => {
                  setEmail(d.value);
                  if (error) setError(null);
                }} 
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>Role:</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  style={{ 
                    padding: 6, 
                    fontSize: 13, 
                    borderRadius: 4, 
                    border: '1px solid #ccc' 
                  }}
                >
                  <option value="read">Read</option>
                  <option value="write">Write</option>
                </select>
              </div>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>
                <input 
                  type="checkbox" 
                  checked={sendInvitation} 
                  onChange={e => setSendInvitation(e.target.checked)} 
                />
                Send email invitation
              </label>
              <div style={{ fontSize: 11, color: '#666' }}>
                Creates an invite granting the selected role. {
                  sendInvitation 
                    ? 'An email invitation will be sent.' 
                    : 'Email invitation will NOT be sent.'
                }
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button 
              appearance="primary" 
              disabled={sharing} 
              onClick={handleSubmit}
            >
              {sharing ? 'Sharing…' : 'Share'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ShareDialog;
