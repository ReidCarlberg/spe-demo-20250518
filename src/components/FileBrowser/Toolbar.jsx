import React from 'react';
import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { 
  ArrowClockwise24Regular,
  ArrowUpload24Regular,
  Document24Regular,
  Folder24Regular,
  MoreHorizontal24Regular,
  Info24Regular,
  Delete24Regular
} from '@fluentui/react-icons';

const Toolbar = ({ 
  isLoading,
  isUploading,
  onRefresh,
  onUpload,
  onCreateFile,
  onCreateFolder,
  onBackToContainers,
  onDriveInfo,
  onMetadata,
  onColumns,
  onRecycleBin
}) => {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexGrow: 1 }}>
        <Button 
          icon={<ArrowClockwise24Regular />} 
          onClick={onRefresh} 
          disabled={isLoading}
        >
          {isLoading ? 'Loading…' : 'Refresh'}
        </Button>
        
        <Button 
          icon={<ArrowUpload24Regular />} 
          onClick={onUpload} 
          disabled={isUploading}
        >
          {isUploading ? 'Uploading…' : 'Upload Files'}
        </Button>
        
        <Button 
          icon={<Document24Regular />} 
          onClick={onCreateFile}
        >
          New Office File
        </Button>
        
        <Button 
          icon={<Folder24Regular />} 
          onClick={onCreateFolder}
        >
          New Folder
        </Button>
        
        <Button onClick={onBackToContainers}>
          Back to Containers
        </Button>
      </div>
      
      <div style={{ marginLeft: 'auto' }}>
        <Menu positioning="below-end">
          <MenuTrigger disableButtonEnhancement>
            <Button icon={<MoreHorizontal24Regular />}>More</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem 
                icon={<Info24Regular />} 
                onClick={onDriveInfo} 
                disabled={isLoading}
              >
                Drive Info
              </MenuItem>
              <MenuItem onClick={onMetadata}>
                Container Properties
              </MenuItem>
              <MenuItem onClick={onColumns}>
                Container Columns
              </MenuItem>
              <MenuItem 
                icon={<Delete24Regular />}
                onClick={onRecycleBin}
              >
                Recycle Bin
              </MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </div>
  );
};

export default Toolbar;
