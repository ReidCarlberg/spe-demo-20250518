import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHeaderCell, 
  TableBody, 
  TableCell,
  Button
} from '@fluentui/react-components';
import { FolderOpen24Regular, Document24Regular } from '@fluentui/react-icons';
import FileActions from './FileActions';
import { getFileTypeFromMime, formatFileSize, formatFolderChildCount, formatDate } from './fileUtils';

const FileList = ({ 
  files, 
  isLoading,
  onFileClick,
  onPreview,
  onDownload,
  onEditFields,
  onDelete,
  onShare,
  onRename,
  onNavigateToFolder,
  onDragOver,
  onDrop,
  onTriggerFileInput
}) => {
  if (isLoading) {
    return <p className="loading-text">Loading files...</p>;
  }

  if (files.length === 0) {
    return (
      <div 
        className="empty-state drop-zone" 
        onDragOver={onDragOver} 
        onDrop={onDrop} 
        style={{ 
          padding: 40, 
          border: '2px dashed #bbb', 
          textAlign: 'center', 
          borderRadius: 8 
        }}
      >
        <p style={{ fontSize: 16, marginBottom: 8 }}>No files here yet.</p>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
          Drag & drop files to upload or use the Upload / New buttons.
        </p>
        <Button appearance="primary" onClick={onTriggerFileInput}>
          Upload Files
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHeaderCell className="col-name" style={{ width: '56%' }}>
            Name
          </TableHeaderCell>
          <TableHeaderCell className="col-modified" style={{ width: '22%' }}>
            Modified
          </TableHeaderCell>
          <TableHeaderCell className="col-size" style={{ width: '12%', textAlign: 'right' }}>
            Size
          </TableHeaderCell>
          <TableHeaderCell className="col-actions" style={{ width: '10%', textAlign: 'right' }}>
            Actions
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const fileType = file.folder ? 'folder' : getFileTypeFromMime(file.file?.mimeType, file.name);
          const sizeLabel = !file.folder && file.size ? 
            formatFileSize(file.size) : 
            formatFolderChildCount(file);
          const modified = formatDate(file.lastModifiedDateTime);
          
          return (
            <TableRow key={file.id}>
              <TableCell className="col-name">
                <Button
                  appearance="transparent"
                  onClick={() => onFileClick(file)}
                  className="item-link item-button"
                  aria-label={file.folder ? `Open folder ${file.name}` : `Open ${file.name}`}
                  style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {file.folder ? <FolderOpen24Regular /> : <Document24Regular />}
                  <span className="item-text">{file.name}</span>
                </Button>
              </TableCell>
              <TableCell className="col-modified">{modified}</TableCell>
              <TableCell className="col-size" style={{ textAlign: 'right' }}>
                {sizeLabel}
              </TableCell>
              <TableCell className="col-actions" style={{ textAlign: 'right' }}>
                <FileActions
                  file={file}
                  onPreview={onPreview}
                  onDownload={onDownload}
                  onEditFields={onEditFields}
                  onDelete={onDelete}
                  onShare={onShare}
                  onRename={onRename}
                  onNavigateToFolder={onNavigateToFolder}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default FileList;
