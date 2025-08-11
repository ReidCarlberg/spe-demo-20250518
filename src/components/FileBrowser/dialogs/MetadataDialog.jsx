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

const MetadataDialog = ({ 
  open, 
  onOpenChange, 
  properties,
  loading,
  error,
  onAddProperty,
  onLoadProperties
}) => {
  const [propName, setPropName] = useState('');
  const [propValue, setPropValue] = useState('');
  const [propSearchable, setPropSearchable] = useState(true);
  const [addingProp, setAddingProp] = useState(false);

  useEffect(() => {
    if (open && !properties && !loading) {
      onLoadProperties();
    }
  }, [open, properties, loading, onLoadProperties]);

  const handleAddProperty = async () => {
    if (!propName.trim()) {
      return;
    }
    
    setAddingProp(true);
    
    try {
      await onAddProperty(propName.trim(), propValue, propSearchable);
      setPropName('');
      setPropValue('');
      setPropSearchable(true);
    } catch (err) {
      // Error is handled by the parent component
    } finally {
      setAddingProp(false);
    }
  };

  const handleReset = () => {
    setPropName('');
    setPropValue('');
    setPropSearchable(true);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => {
      if (!d.open) handleClose();
    }}>
      <DialogSurface style={{ maxWidth: 640 }}>
        <DialogBody>
          <DialogTitle>Container Properties</DialogTitle>
          <DialogContent>
            {loading && <p>Loading properties...</p>}
            {error && (
              <p style={{ color: 'crimson', fontSize: 12 }} role="alert">
                {error}
              </p>
            )}
            {!loading && properties && (
              <div style={{ marginBottom: 16 }}>
                {Object.keys(properties).filter(k => !k.startsWith('@')).length === 0 && (
                  <p style={{ fontStyle: 'italic' }}>No properties set.</p>
                )}
                {Object.entries(properties)
                  .filter(([k]) => !k.startsWith('@'))
                  .map(([k, v]) => (
                    <div 
                      key={k} 
                      style={{ 
                        padding: '6px 8px', 
                        border: '1px solid #ddd', 
                        borderRadius: 6, 
                        marginBottom: 6 
                      }}
                    >
                      <strong>{k}</strong>: <span>{v?.value ?? ''}</span>
                      {v?.isSearchable && (
                        <span 
                          style={{ 
                            marginLeft: 8, 
                            fontSize: 11, 
                            background: '#eef', 
                            padding: '2px 6px', 
                            borderRadius: 12 
                          }}
                        >
                          searchable
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
            <div style={{ borderTop: '1px solid #e1e4e8', paddingTop: 12, marginTop: 8 }}>
              <h4 style={{ margin: '4px 0 8px' }}>Add Property</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Input 
                  size="small" 
                  value={propName} 
                  placeholder="Property name" 
                  onChange={(_, d) => setPropName(d.value)} 
                />
                <Input 
                  size="small" 
                  value={propValue} 
                  placeholder="Property value" 
                  onChange={(_, d) => setPropValue(d.value)} 
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <input 
                    type="checkbox" 
                    checked={propSearchable} 
                    onChange={e => setPropSearchable(e.target.checked)} 
                  />
                  Searchable
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    appearance="primary" 
                    size="small" 
                    disabled={addingProp} 
                    onClick={handleAddProperty}
                  >
                    {addingProp ? 'Adding...' : 'Add'}
                  </Button>
                  <Button 
                    size="small" 
                    appearance="secondary" 
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default MetadataDialog;
