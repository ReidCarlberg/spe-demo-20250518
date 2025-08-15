import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogSurface, 
  DialogBody, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem
} from '@fluentui/react-components';
import { 
  Delete24Regular,
  ArrowUndo24Regular,
  MoreHorizontal24Regular,
  Document24Regular
} from '@fluentui/react-icons';
import { speService } from '../../../services';

const RecycleBinDialog = ({ open, onOpenChange, containerId, onRefreshFiles }) => {
  const [recycleBinItems, setRecycleBinItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecycleBinItems = async () => {
    if (!containerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await speService.listRecycleBinItems(containerId);
      setRecycleBinItems(items);
    } catch (err) {
      console.error('Error fetching recycle bin items:', err);
      setError('Failed to load recycle bin items: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (item) => {
    try {
      setError(null);
      await speService.restoreRecycleBinItem(containerId, item.id);
      
      // Refresh both recycle bin and main file list
      await fetchRecycleBinItems();
      if (onRefreshFiles) {
        onRefreshFiles();
      }
    } catch (err) {
      console.error('Error restoring item:', err);
      setError('Failed to restore item: ' + err.message);
    }
  };

  const handlePermanentDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setError(null);
      await speService.permanentlyDeleteRecycleBinItem(containerId, item.id);
      
      // Refresh recycle bin list
      await fetchRecycleBinItems();
    } catch (err) {
      console.error('Error permanently deleting item:', err);
      setError('Failed to permanently delete item: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (open && containerId) {
      fetchRecycleBinItems();
    }
  }, [open, containerId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modalType="modal">
      <DialogSurface style={{ minWidth: '700px', maxWidth: '900px' }}>
        <DialogBody>
          <DialogTitle>Recycle Bin</DialogTitle>
          <DialogContent>
            {error && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '12px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '6px', 
                color: '#991b1b' 
              }}>
                {error}
              </div>
            )}
            
            {loading ? (
              <p>Loading recycle bin items...</p>
            ) : recycleBinItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>The recycle bin is empty.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell style={{ width: '40%' }}>Name</TableHeaderCell>
                    <TableHeaderCell style={{ width: '15%' }}>Size</TableHeaderCell>
                    <TableHeaderCell style={{ width: '20%' }}>Deleted</TableHeaderCell>
                    <TableHeaderCell style={{ width: '15%' }}>Deleted By</TableHeaderCell>
                    <TableHeaderCell style={{ width: '10%', textAlign: 'right' }}>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recycleBinItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Document24Regular />
                          <span>{item.name || item.title || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatSize(item.size)}</TableCell>
                      <TableCell>{formatDate(item.deletedDateTime)}</TableCell>
                      <TableCell>
                        {item.deletedBy?.user?.displayName || 'Unknown'}
                      </TableCell>
                      <TableCell style={{ textAlign: 'right' }}>
                        <Menu positioning="below-end">
                          <MenuTrigger disableButtonEnhancement>
                            <Button 
                              appearance="subtle" 
                              icon={<MoreHorizontal24Regular />} 
                              aria-label="More actions" 
                            />
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem 
                                icon={<ArrowUndo24Regular />}
                                onClick={() => handleRestore(item)}
                              >
                                Restore
                              </MenuItem>
                              <MenuItem 
                                icon={<Delete24Regular />}
                                onClick={() => handlePermanentDelete(item)}
                              >
                                Delete Permanently
                              </MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              appearance="secondary" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button 
              appearance="primary" 
              onClick={fetchRecycleBinItems}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default RecycleBinDialog;
