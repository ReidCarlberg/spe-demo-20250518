import { useState } from 'react';
import { speService } from '../../services';

export const useContainerData = (containerId) => {
  const [driveInfo, setDriveInfo] = useState(null);
  const [properties, setProperties] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDriveInfo = async () => {
    if (!containerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const info = await speService.getDriveInfo(containerId);
      setDriveInfo(info);
      return info;
    } catch (err) {
      console.error('Failed to load drive info:', err);
      setError('Failed to load drive info: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    if (!containerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const props = await speService.getContainerProperties(containerId);
      setProperties(props);
      return props;
    } catch (err) {
      console.error('Failed to load properties:', err);
      setError('Failed to load properties: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (name, value, isSearchable) => {
    if (!name.trim()) {
      throw new Error('Name required');
    }
    
    setError(null);
    
    try {
      await speService.addContainerProperty(containerId, name.trim(), value, isSearchable);
      const refreshed = await speService.getContainerProperties(containerId);
      setProperties(refreshed);
      return refreshed;
    } catch (err) {
      console.error('Failed to add property:', err);
      setError('Failed to add property: ' + err.message);
      throw err;
    }
  };

  const fetchColumns = async () => {
    if (!containerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
      return data;
    } catch (err) {
      console.error('Failed to load columns:', err);
      setError('Failed to load columns: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createColumn = async (columnData) => {
    if (!columnData.name?.trim()) {
      throw new Error('Column name required');
    }
    
    setError(null);
    
    try {
      const payload = {
        name: columnData.name.trim(),
        displayName: columnData.displayName?.trim() || columnData.name.trim(),
        description: columnData.description?.trim(),
        enforceUniqueValues: false,
        hidden: false,
        indexed: false
      };

      switch (columnData.type) {
        case 'text':
          payload.text = {
            maxLength: parseInt(columnData.maxLength) || 255,
            allowMultipleLines: false,
            appendChangesToExistingText: false,
            linesForEditing: 0
          };
          break;
        case 'choice':
          payload.choice = {
            allowTextEntry: false,
            displayAs: 'dropDownMenu',
            choices: columnData.choices?.split(',').map(c => c.trim()).filter(Boolean) || []
          };
          break;
        case 'boolean':
          payload.boolean = {};
          break;
        case 'number':
          payload.number = { decimalPlaces: 'automatic' };
          break;
        case 'dateTime':
          payload.dateTime = { displayAs: 'default', format: 'dateOnly' };
          break;
        default:
          payload.text = {
            maxLength: 255,
            allowMultipleLines: false,
            appendChangesToExistingText: false,
            linesForEditing: 0
          };
          break;
      }

      await speService.createContainerColumn(containerId, payload);
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
      return data;
    } catch (err) {
      console.error('Failed to create column:', err);
      setError('Failed to create column: ' + err.message);
      throw err;
    }
  };

  const updateColumn = async (columnId, updates) => {
    setError(null);
    
    try {
      const res = await fetch(`/api/containers/${containerId}/columns/${columnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to update column');
      }
      
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
      return data;
    } catch (err) {
      console.error('Failed to update column:', err);
      setError('Failed to update column: ' + err.message);
      throw err;
    }
  };

  const deleteColumn = async (column) => {
    if (!window.confirm(`Delete column ${column.displayName || column.name}?`)) {
      return false;
    }
    
    setError(null);
    
    try {
      await speService.deleteContainerColumn(containerId, column.id);
      const data = await speService.listContainerColumns(containerId);
      setColumns(data);
      return true;
    } catch (err) {
      console.error('Failed to delete column:', err);
      setError('Failed to delete column: ' + err.message);
      throw err;
    }
  };

  const inferColumnType = (col) => {
    if (!col) return 'unknown';
    const known = ['text', 'choice', 'boolean', 'dateTime', 'currency', 'number', 'personOrGroup', 'hyperlinkOrPicture'];
    return known.find(k => col[k]) || 'unknown';
  };

  return {
    driveInfo,
    properties,
    columns,
    loading,
    error,
    fetchDriveInfo,
    fetchProperties,
    addProperty,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,
    inferColumnType,
    setError
  };
};
