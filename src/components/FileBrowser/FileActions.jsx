import React from 'react';
import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { 
  ArrowDownload24Regular, 
  Eye24Regular, 
  Edit24Regular,
  MoreHorizontal24Regular 
} from '@fluentui/react-icons';
import { isPreviewableFile, isOfficeFile } from './fileUtils';

const FileActions = ({ 
  file, 
  onPreview, 
  onDownload, 
  onEditFields, 
  onDelete, 
  onShare, 
  onRename,
  onNavigateToFolder,
  onViewVersions,
  onDownloadPdf
}) => {
  const previewable = !file.folder && isPreviewableFile(file) && !isOfficeFile(file);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Inline action buttons for files */}
      {!file.folder && (
        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center', marginRight: 4 }}>
          {previewable && (
            <Button 
              appearance="subtle" 
              icon={<Eye24Regular />} 
              aria-label="Preview" 
              onClick={(e) => {
                e.stopPropagation();
                onPreview(file);
              }} 
            />
          )}
          <Button 
            appearance="subtle" 
            icon={<ArrowDownload24Regular />} 
            aria-label="Download" 
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }} 
          />
        </div>
      )}
      
      {/* More actions menu */}
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
            {file.folder ? (
              <>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToFolder(file);
                  }}
                >
                  Open
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(file);
                  }}
                >
                  <Edit24Regular style={{ marginRight: 8 }} />
                  Rename
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                >
                  Delete
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(file);
                  }}
                >
                  <Edit24Regular style={{ marginRight: 8 }} />
                  Rename
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditFields(file);
                  }}
                >
                  Edit Document Fields
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewVersions && onViewVersions(file);
                  }}
                >
                  Versions
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadPdf && onDownloadPdf(file);
                  }}
                >
                  Download as PDF
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                  }}
                >
                  Delete
                </MenuItem>
                <MenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(file);
                  }}
                >
                  Share
                </MenuItem>
              </>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
};

export default FileActions;
