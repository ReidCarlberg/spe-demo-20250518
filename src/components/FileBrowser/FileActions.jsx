import React from 'react';
import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import {
  ArrowDownload24Regular,
  Eye24Regular,
  Edit24Regular,
  MoreHorizontal24Regular,
  Window24Regular,
  DocumentPdf24Regular,
  History24Regular
} from '@fluentui/react-icons';
import { isPreviewableFile, isOfficeFile } from './fileUtils';
import { useNavigate } from 'react-router-dom';

const FileActions = ({
  file,
  onPreview,
  onPreviewInIframe,
  onDownload,
  onEditFields,
  onDelete,
  onShare,
  onRename,
  onNavigateToFolder,
  onShowVersions,
  onDownloadPdf
}) => {
  const navigate = useNavigate();
  const previewable = !file.folder && isPreviewableFile(file) && !isOfficeFile(file);
  const isOffice = !file.folder && isOfficeFile(file);

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
          <Button appearance="subtle" icon={<MoreHorizontal24Regular />} aria-label="More actions" />
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
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (typeof onShowVersions === 'function') {
                      await onShowVersions(file);
                    }
                  }}
                >
                  <History24Regular style={{ marginRight: 8 }} />
                  Version
                </MenuItem>
                <MenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (typeof onDownloadPdf === 'function') {
                      await onDownloadPdf(file);
                    }
                  }}
                >
                  <DocumentPdf24Regular style={{ marginRight: 8 }} />
                  Download as PDF
                </MenuItem>
                {isOffice && (
                  <MenuItem
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        if (typeof onPreviewInIframe === 'function') {
                          const url = await onPreviewInIframe(file);
                          if (url) {
                            navigate('/iframe-preview', { state: { url, name: file.name } });
                            return;
                          }
                        }
                        if (file.webUrl) {
                          navigate('/iframe-preview', { state: { url: file.webUrl, name: file.name } });
                        }
                      } catch (err) {
                        console.error('Preview in iframe failed', err);
                      }
                    }}
                  >
                    <Window24Regular style={{ marginRight: 8 }} />
                    Preview in iframe
                  </MenuItem>
                )}
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
