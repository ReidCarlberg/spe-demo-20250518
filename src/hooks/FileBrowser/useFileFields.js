import { useState } from 'react';
import { speService } from '../../services';

export const useFileFields = (containerId) => {
  const [activeFile, setActiveFile] = useState(null);
  const [fieldsColumns, setFieldsColumns] = useState([]);
  const [fileFieldValues, setFileFieldValues] = useState({});
  const [fieldEdits, setFieldEdits] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const loadFileFields = async (file) => {
    if (!containerId || !file || file.folder) return;
    
    setActiveFile(file);
    setLoading(true);
    setError(null);
    setSaveMessage(null);
    
    try {
      const [cols, fields] = await Promise.all([
        speService.listContainerColumns(containerId),
        speService.getFileFields(containerId, file.id)
      ]);
      
      setFieldsColumns(cols);
      setFileFieldValues(fields);
      setFieldEdits(fields);
      return { cols, fields };
    } catch (err) {
      console.error('Failed to load file fields:', err);
      setError('Failed to load file fields: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setFieldEdits(prev => ({ ...prev, [fieldName]: value }));
    if (saveMessage) setSaveMessage(null);
  };

  const saveFieldChanges = async () => {
    if (!activeFile) return;
    
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    
    try {
      const diffEntries = Object.entries(fieldEdits).filter(
        ([k, v]) => fileFieldValues[k] !== v
      );
      
      for (const [name, val] of diffEntries) {
        await speService.updateFileField(containerId, activeFile.id, name, val);
      }
      
      setFileFieldValues(fieldEdits);
      setSaveMessage(
        diffEntries.length 
          ? 'Fields saved successfully.' 
          : 'No changes to save.'
      );
      
      return true;
    } catch (err) {
      console.error('Failed to save field changes:', err);
      setError('Failed to save field changes: ' + err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const resetFields = () => {
    setActiveFile(null);
    setFieldsColumns([]);
    setFileFieldValues({});
    setFieldEdits({});
    setError(null);
    setSaveMessage(null);
    setLoading(false);
    setSaving(false);
  };

  const inferColumnType = (col) => {
    if (!col) return 'unknown';
    const known = ['text', 'choice', 'boolean', 'dateTime', 'currency', 'number', 'personOrGroup', 'hyperlinkOrPicture'];
    return known.find(k => col[k]) || 'unknown';
  };

  return {
    activeFile,
    fieldsColumns,
    fileFieldValues,
    fieldEdits,
    loading,
    saving,
    error,
    saveMessage,
    loadFileFields,
    handleFieldChange,
    saveFieldChanges,
    resetFields,
    inferColumnType
  };
};
