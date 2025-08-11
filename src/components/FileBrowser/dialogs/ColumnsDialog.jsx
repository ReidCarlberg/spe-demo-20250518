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
import EditColumnDialog from './EditColumnDialog';

const ColumnsDialog = ({ 
  open, 
  onOpenChange, 
  columns,
  loading,
  error,
  onLoadColumns,
  onCreateColumn,
  onUpdateColumn,
  onDeleteColumn,
  inferColumnType,
  deletingColumnId
}) => {
  const [colName, setColName] = useState('');
  const [colDisplayName, setColDisplayName] = useState('');
  const [colDescription, setColDescription] = useState('');
  const [colType, setColType] = useState('text');
  const [colChoices, setColChoices] = useState('');
  const [colMaxLength, setColMaxLength] = useState('255');
  const [creatingColumn, setCreatingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);

  useEffect(() => {
    if (open && columns.length === 0 && !loading) {
      onLoadColumns();
    }
  }, [open, columns.length, loading, onLoadColumns]);

  const resetColumnForm = () => {
    setColName('');
    setColDisplayName('');
    setColDescription('');
    setColType('text');
    setColChoices('');
    setColMaxLength('255');
    setCreatingColumn(false);
  };

  const handleCreateColumn = async () => {
    if (!colName.trim()) {
      return;
    }
    
    setCreatingColumn(true);
    
    try {
      await onCreateColumn({
        name: colName,
        displayName: colDisplayName,
        description: colDescription,
        type: colType,
        choices: colChoices,
        maxLength: colMaxLength
      });
      resetColumnForm();
    } catch (err) {
      // Error is handled by the parent component
    } finally {
      setCreatingColumn(false);
    }
  };

  const handleClose = () => {
    resetColumnForm();
    setEditingColumn(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(_, d) => {
        if (!d.open) handleClose();
      }}>
        <DialogSurface style={{ maxWidth: 760 }}>
          <DialogBody>
            <DialogTitle>Container Columns</DialogTitle>
            <DialogContent>
              {loading && <p>Loading columns...</p>}
              {error && (
                <p style={{ color: 'crimson', fontSize: 12 }} role="alert">
                  {error}
                </p>
              )}
              {!loading && !error && columns.length === 0 && (
                <p style={{ fontStyle: 'italic' }}>No columns defined.</p>
              )}
              {!loading && columns.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {columns.map(col => (
                    <div 
                      key={col.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        border: '1px solid #ddd', 
                        padding: '6px 10px', 
                        borderRadius: 6, 
                        marginBottom: 6 
                      }}
                    >
                      <div>
                        <strong>{col.displayName || col.name}</strong>
                        <span 
                          style={{ 
                            fontSize: 11, 
                            background: '#eef', 
                            padding: '2px 6px', 
                            borderRadius: 12, 
                            marginLeft: 4 
                          }}
                        >
                          {inferColumnType(col)}
                        </span>
                        {col.description && (
                          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                            {col.description}
                          </div>
                        )}
                        {col.isDeletable === false && (
                          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                            System / non-deletable
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Button 
                          appearance="subtle" 
                          size="small" 
                          onClick={() => setEditingColumn(col)}
                        >
                          Edit
                        </Button>
                        {col.isDeletable !== false && (
                          <Button 
                            appearance="subtle" 
                            size="small" 
                            disabled={deletingColumnId === col.id} 
                            onClick={() => onDeleteColumn(col)}
                          >
                            {deletingColumnId === col.id ? 'Deleting…' : 'Delete'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ borderTop: '1px solid #e1e4e8', paddingTop: 12 }}>
                <h4 style={{ margin: '4px 0 8px' }}>Add Column</h4>
                <div style={{ 
                  display: 'grid', 
                  gap: 8, 
                  gridTemplateColumns: '1fr 1fr', 
                  marginBottom: 8 
                }}>
                  <Input 
                    size="small" 
                    value={colName} 
                    placeholder="Name *" 
                    onChange={(_, d) => setColName(d.value)} 
                  />
                  <Input 
                    size="small" 
                    value={colDisplayName} 
                    placeholder="Display name" 
                    onChange={(_, d) => setColDisplayName(d.value)} 
                  />
                  <Input 
                    size="small" 
                    value={colDescription} 
                    placeholder="Description" 
                    onChange={(_, d) => setColDescription(d.value)} 
                  />
                  <select 
                    value={colType} 
                    onChange={e => setColType(e.target.value)} 
                    style={{ 
                      fontSize: 12, 
                      padding: 6, 
                      borderRadius: 4, 
                      border: '1px solid #ccc' 
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="choice">Choice</option>
                    <option value="boolean">Boolean</option>
                    <option value="number">Number</option>
                    <option value="dateTime">Date/Time</option>
                  </select>
                </div>
                {colType === 'text' && (
                  <div style={{ marginBottom: 8 }}>
                    <Input 
                      size="small" 
                      value={colMaxLength} 
                      placeholder="Max length" 
                      onChange={(_, d) => setColMaxLength(d.value)} 
                    />
                  </div>
                )}
                {colType === 'choice' && (
                  <div style={{ marginBottom: 8 }}>
                    <Input 
                      size="small" 
                      value={colChoices} 
                      placeholder="Choices (comma separated)" 
                      onChange={(_, d) => setColChoices(d.value)} 
                    />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button 
                    appearance="primary" 
                    size="small" 
                    disabled={creatingColumn} 
                    onClick={handleCreateColumn}
                  >
                    {creatingColumn ? 'Creating…' : 'Create Column'}
                  </Button>
                  <Button 
                    size="small" 
                    appearance="secondary" 
                    onClick={resetColumnForm}
                  >
                    Reset
                  </Button>
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

      <EditColumnDialog
        column={editingColumn}
        open={!!editingColumn}
        onOpenChange={(open) => {
          if (!open) setEditingColumn(null);
        }}
        onUpdateColumn={onUpdateColumn}
      />
    </>
  );
};

export default ColumnsDialog;
