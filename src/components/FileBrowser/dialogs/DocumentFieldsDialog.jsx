import React from 'react';
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

const DocumentFieldsDialog = ({ 
  open, 
  onOpenChange, 
  activeFile,
  fieldsColumns,
  fieldEdits,
  loading,
  saving,
  error,
  saveMessage,
  onFieldChange,
  onSaveFields,
  inferColumnType
}) => {
  const handleClose = () => {
    onOpenChange(false);
  };

  const renderFieldInput = (col) => {
    const type = inferColumnType(col);
    const name = col.name;
    const value = fieldEdits[name];
    const onChange = (val) => onFieldChange(name, val);

    switch (type) {
      case 'choice':
        if (col.choice?.choices) {
          return (
            <select 
              value={value ?? ''} 
              onChange={e => onChange(e.target.value)} 
              style={{ 
                padding: 6, 
                fontSize: 13, 
                borderRadius: 4, 
                border: '1px solid #ccc' 
              }}
            >
              <option value="">-- Select --</option>
              {col.choice.choices.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          );
        }
        break;
      case 'boolean':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input 
              type="checkbox" 
              checked={!!value} 
              onChange={e => onChange(e.target.checked)} 
            />
            <span style={{ fontSize: 12 }}>True / False</span>
          </label>
        );
      case 'number':
        return (
          <Input 
            type="number" 
            value={value ?? ''} 
            onChange={(_, d) => onChange(d.value === '' ? '' : Number(d.value))} 
          />
        );
      case 'dateTime':
        return (
          <Input 
            type="datetime-local" 
            value={value ? new Date(value).toISOString().slice(0, 16) : ''} 
            onChange={(_, d) => {
              const iso = d.value ? new Date(d.value).toISOString() : '';
              onChange(iso);
            }} 
          />
        );
      default:
        return (
          <Input 
            value={value ?? ''} 
            onChange={(_, d) => onChange(d.value)} 
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => {
      if (!d.open) handleClose();
    }}>
      <DialogSurface style={{ maxWidth: 720 }}>
        <DialogBody>
          <DialogTitle>
            Edit Document Fields{activeFile ? ` – ${activeFile.name}` : ''}
          </DialogTitle>
          <DialogContent>
            {loading && <p>Loading fields...</p>}
            {error && (
              <p style={{ color: 'crimson', fontSize: 12 }} role="alert">
                {error}
              </p>
            )}
            {!loading && !error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fieldsColumns.length === 0 && (
                  <p style={{ fontStyle: 'italic' }}>
                    No columns defined for this container.
                  </p>
                )}
                {fieldsColumns.map(col => (
                  <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontWeight: 600, fontSize: 13 }}>
                      {col.displayName || col.name}
                    </label>
                    {renderFieldInput(col)}
                    {col.description && (
                      <div style={{ fontSize: 11, color: '#666' }}>
                        {col.description}
                      </div>
                    )}
                  </div>
                ))}
                {saveMessage && (
                  <div style={{ fontSize: 12, color: 'green' }}>
                    {saveMessage}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button 
              appearance="primary" 
              disabled={saving || loading} 
              onClick={onSaveFields}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default DocumentFieldsDialog;
