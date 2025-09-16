# SharePoint Embedded Services Refactoring

This directory contains the refactored SharePoint Embedded services, broken down into smaller, more maintainable modules.

## Directory Structure

```
services/
├── index.js                    # Main exports and legacy compatibility
├── shared/
│   ├── graphApiClient.js      # Common Graph API HTTP client
│   └── constants.js           # Shared constants and endpoints
├── containers/
│   ├── containerService.js    # Container CRUD operations
│   └── containerPermissionsService.js # Container permissions
├── files/
│   ├── fileService.js         # File/folder operations
│   ├── fileUploadService.js   # File upload handling
│   └── fileSearchService.js   # File search functionality
├── recycleBin/
│   └── recycleBinService.js   # Recycle bin operations
└── columns/
    └── columnService.js       # Container column management
```

## Usage

### New Modular Approach (Recommended)

Import specific services as needed:

```javascript
import { ContainerService, FileService } from './services';

// Use the services
const containers = await ContainerService.getContainers();
const files = await FileService.listFiles(containerId);
```

### Legacy Compatibility

The original `speService` object is still available for backward compatibility:

```javascript
import { speService } from './services';

// Works exactly like before
const containers = await speService.getContainers();
const files = await speService.listFiles(containerId);
```

## Services Overview

### ContainerService
- `getContainers()` - List all containers
- `createContainer(data)` - Create new container
- `deleteContainer(id)` - Delete container
- `getDriveInfo(id)` - Get drive information
- `getContainerProperties(id)` - Get custom properties
- `addContainerProperty(id, name, value, searchable)` - Add custom property

### ContainerPermissionsService
- `getContainerPermissions(id)` - List permissions
- `grantContainerPermission(id, email, role)` - Grant permission

### FileService
- `listFiles(containerId, folderId)` - List files/folders
- `getFileDetails(containerId, itemId)` - Get file details
- `uploadFile(containerId, folderId, file, onProgress)` - Upload file
- `getFilePreviewUrl(driveId, itemId)` - Get preview URL
- `deleteFile(driveId, itemId)` - Delete file
- `createBlankFile(driveId, folderId, fileName)` - Create Office file
- `createFolder(driveId, folderId, name)` - Create folder
- `renameItem(driveId, itemId, newName)` - Rename item
- `getFileFields(driveId, itemId)` - Get list item fields
- `updateFileField(driveId, itemId, field, value)` - Update field
- `inviteFileAccess(driveId, itemId, email, role, options)` - Share file
- `listItemVersions(driveId, itemId)` - List versions
- `downloadItemAsPdf(driveId, itemId)` - Download as PDF

### FileUploadService
- `simpleUpload(containerId, folderId, file)` - Small file upload
- `largeFileUpload(containerId, folderId, file, onProgress)` - Large file upload
- `getFileChunk(file, start, end)` - Get file chunk

### FileSearchService
- `searchFiles(containerId, searchTerm, limit)` - Basic search
- `advancedSearch(options)` - Advanced Graph search

### RecycleBinService
- `listRecycleBinItems(containerId)` - List recycled items
- `permanentlyDeleteRecycleBinItem(containerId, ids)` - Permanent delete
- `restoreRecycleBinItem(containerId, ids)` - Restore items

### ColumnService
- `listContainerColumns(containerId)` - List columns
- `createContainerColumn(containerId, payload)` - Create column
- `deleteContainerColumn(containerId, columnId)` - Delete column

### GraphApiClient
Shared HTTP client with common methods:
- `get(url)` - GET request
- `post(url, body)` - POST request
- `put(url, body, headers)` - PUT request
- `patch(url, body)` - PATCH request
- `delete(url)` - DELETE request
- `fetchRaw(url, options)` - Raw fetch for file downloads

## Benefits of Refactoring

1. **Modularity**: Each service has a single responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Testability**: Individual services can be unit tested in isolation
4. **Code Reuse**: Shared GraphApiClient reduces duplication
5. **Type Safety**: Better IDE support and error detection
6. **Performance**: Tree-shaking can eliminate unused code
7. **Backwards Compatibility**: Existing code continues to work

## Migration Guide

### For New Code
Use the individual service classes:

```javascript
// Instead of this:
import { speService } from './speService';
await speService.getContainers();

// Use this:
import { ContainerService } from './services';
await ContainerService.getContainers();
```

### For Existing Code
No changes needed! The legacy `speService` object maintains full compatibility.

### Gradual Migration
You can migrate incrementally by updating imports one file at a time:

1. Change import from `./speService` to `./services`
2. Update method calls from `speService.method()` to `ServiceClass.method()`
3. Test thoroughly
4. Repeat for other files

## Constants

All API endpoints, file size limits, and other constants are centralized in `shared/constants.js`:

- `GRAPH_ENDPOINTS` - API endpoint URLs
- `CONTAINER_ROLES` - Valid permission roles
- `UPLOAD_CONSTANTS` - File upload settings
- `HTTP_STATUS` - Status code constants

## Error Handling

All services use consistent error handling:
- Errors are logged to console with context
- Original errors are re-thrown for handling by calling code
- GraphApiClient provides standardized error responses
