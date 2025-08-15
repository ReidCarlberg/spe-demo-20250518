/**
 * Services exports
 * 
 * This file exports all the refactored services and maintains backward compatibility
 * with the original speService interface.
 */

// Export all services
export { ContainerService } from './containers/containerService.js';
export { ContainerPermissionsService } from './containers/containerPermissionsService.js';
export { FileService } from './files/fileService.js';
export { FileUploadService } from './files/fileUploadService.js';
export { FileSearchService } from './files/fileSearchService.js';
export { RecycleBinService } from './recycleBin/recycleBinService.js';
export { ColumnService } from './columns/columnService.js';
export { GraphApiClient } from './shared/graphApiClient.js';
export * from './shared/constants.js';

// Legacy compatibility object that maintains the same interface as the original speService
import { ContainerService } from './containers/containerService.js';
import { ContainerPermissionsService } from './containers/containerPermissionsService.js';
import { FileService } from './files/fileService.js';
import { FileSearchService } from './files/fileSearchService.js';
import { RecycleBinService } from './recycleBin/recycleBinService.js';
import { ColumnService } from './columns/columnService.js';

/**
 * Legacy speService object that maintains backward compatibility
 * @deprecated Use the individual service classes instead
 */
export const speService = {
  // Container operations
  getContainers: ContainerService.getContainers.bind(ContainerService),
  createContainer: ContainerService.createContainer.bind(ContainerService),
  deleteContainer: ContainerService.deleteContainer.bind(ContainerService),
  getDriveInfo: ContainerService.getDriveInfo.bind(ContainerService),
  getContainerProperties: ContainerService.getContainerProperties.bind(ContainerService),
  addContainerProperty: ContainerService.addContainerProperty.bind(ContainerService),

  // Container permissions
  getContainerPermissions: ContainerPermissionsService.getContainerPermissions.bind(ContainerPermissionsService),
  grantContainerPermission: ContainerPermissionsService.grantContainerPermission.bind(ContainerPermissionsService),

  // File operations
  listFiles: FileService.listFiles.bind(FileService),
  getFileDetails: FileService.getFileDetails.bind(FileService),
  uploadFile: FileService.uploadFile.bind(FileService),
  getFilePreviewUrl: FileService.getFilePreviewUrl.bind(FileService),
  deleteFile: FileService.deleteFile.bind(FileService),
  createBlankFile: FileService.createBlankFile.bind(FileService),
  createFolder: FileService.createFolder.bind(FileService),
  renameItem: FileService.renameItem.bind(FileService),
  getFileFields: FileService.getFileFields.bind(FileService),
  updateFileField: FileService.updateFileField.bind(FileService),
  inviteFileAccess: FileService.inviteFileAccess.bind(FileService),
  listItemVersions: FileService.listItemVersions.bind(FileService),
  downloadItemAsPdf: FileService.downloadItemAsPdf.bind(FileService),

  // Search operations
  searchFiles: FileSearchService.searchFiles.bind(FileSearchService),
  advancedSearch: FileSearchService.advancedSearch.bind(FileSearchService),

  // Recycle bin operations
  listRecycleBinItems: RecycleBinService.listRecycleBinItems.bind(RecycleBinService),
  permanentlyDeleteRecycleBinItem: RecycleBinService.permanentlyDeleteRecycleBinItem.bind(RecycleBinService),
  restoreRecycleBinItem: RecycleBinService.restoreRecycleBinItem.bind(RecycleBinService),

  // Column operations (beta)
  listContainerColumns: ColumnService.listContainerColumns.bind(ColumnService),
  createContainerColumn: ColumnService.createContainerColumn.bind(ColumnService),
  deleteContainerColumn: ColumnService.deleteContainerColumn.bind(ColumnService),

  // Deprecated methods that were part of the file upload flow
  simpleUpload: FileService.uploadFile.bind(FileService), // Redirects to uploadFile which handles the logic internally
  largeFileUpload: FileService.uploadFile.bind(FileService), // Redirects to uploadFile which handles the logic internally
  getFileChunk: async (file, start, end) => {
    console.warn('getFileChunk is deprecated and handled internally by FileUploadService');
    return file.slice(start, end + 1);
  }
};