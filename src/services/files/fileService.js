import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS, QUERY_PARAMS, UPLOAD_CONSTANTS, FILE_SHARING_ROLES } from '../shared/constants.js';
import { FileUploadService } from './fileUploadService.js';

/**
 * Service for managing files and folders in SharePoint Embedded containers
 */
export class FileService {
  /**
   * List files and folders in a container or folder
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder (optional, defaults to 'root')
   * @returns {Promise<Array>} List of files and folders
   */
  static async listFiles(containerId, folderId = 'root') {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${containerId}/items/${folderId}/children?${QUERY_PARAMS.EXPAND_LIST_ITEM}`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }

  /**
   * Get details of a specific file or folder
   * @param {string} containerId The ID of the container
   * @param {string} itemId The ID of the file or folder
   * @returns {Promise<Object>} File or folder details
   */
  static async getFileDetails(containerId, itemId) {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${containerId}/items/${itemId}`;
      return await GraphApiClient.get(url);
    } catch (error) {
      console.error('Error fetching file details:', error);
      throw error;
    }
  }

  /**
   * Upload a file to a container or folder
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder (optional, defaults to 'root')
   * @param {File} file The file to upload
   * @param {Function} onProgress Progress callback function (optional)
   * @returns {Promise<Object>} Uploaded file details
   */
  static async uploadFile(containerId, folderId, file, onProgress) {
    try {
      // For files smaller than 4MB, use simple upload
      if (file.size <= UPLOAD_CONSTANTS.SMALL_FILE_THRESHOLD) {
        return await FileUploadService.simpleUpload(containerId, folderId, file);
      } else {
        // For larger files, use large file upload with progress reporting
        return await FileUploadService.largeFileUpload(containerId, folderId, file, onProgress);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Get a preview URL for a file
   * @param {string} driveId The ID of the drive (container)
   * @param {string} itemId The ID of the file
   * @returns {Promise<string>} The preview URL
   */
  static async getFilePreviewUrl(driveId, itemId) {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/preview`;
      const data = await GraphApiClient.post(url);
      
      console.log('Preview API response:', data);
      
      if (data && data.getUrl) {
        const previewUrl = `${data.getUrl}&nb=true`;
        console.log('Generated preview URL:', previewUrl);
        return previewUrl;
      } else {
        throw new Error('Preview URL not found in the response');
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw error;
    }
  }

  /**
   * Get a preview URL using the Microsoft Graph beta endpoint with additional options.
   * Defaults to viewer='office' and allowEdit=true for Office docs.
   * @param {string} driveId The ID of the drive (container)
   * @param {string} itemId The ID of the file
   * @param {{viewer?: 'office'|'onedrive'|null, allowEdit?: boolean, chromeless?: boolean, page?: number|string, zoom?: number}} [options]
   * @returns {Promise<string>} The preview URL to load in an iframe
   */
  static async getFilePreviewUrlBeta(driveId, itemId, options = {}) {
    try {
      const url = `https://graph.microsoft.com/beta/drives/${driveId}/items/${itemId}/preview`;
      const body = {
        viewer: options.viewer ?? 'office',
        allowEdit: options.allowEdit ?? true,
      };
      if (typeof options.chromeless === 'boolean') body.chromeless = options.chromeless;
      if (typeof options.page !== 'undefined') body.page = options.page;
      if (typeof options.zoom === 'number') body.zoom = options.zoom;

      const data = await GraphApiClient.post(url, body);

      if (data?.getUrl) {
        return `${data.getUrl}&nb=true`;
      }

      if (data?.postUrl) {
        const params = data.postParameters || '';
        const html = `<!doctype html><html><body onload="document.forms[0].submit()">
          <form method="POST" action="${data.postUrl}">
            ${params.split('&').map(kv => {
              const [k,v] = kv.split('=');
              const key = decodeURIComponent(k || '');
              const val = decodeURIComponent(v || '');
              return `<input type="hidden" name="${key}" value="${val}">`;
            }).join('')}
          </form>
        </body></html>`;
        return `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
      }

      throw new Error('No preview URL returned from beta API');
    } catch (error) {
      console.error('Error getting beta preview URL:', error);
      throw error;
    }
  }

  /**
   * Delete a file or folder (DriveItem) from a container
   * @param {string} driveId The ID of the container (drive)
   * @param {string} itemId The ID of the file or folder to delete
   * @returns {Promise<void>}
   */
  static async deleteFile(driveId, itemId) {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}`;
      await GraphApiClient.delete(url);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Create blank Office file
   * @param {string} driveId The ID of the drive/container
   * @param {string} folderId The ID of the parent folder (optional, defaults to 'root')
   * @param {string} fileName The name of the file to create
   * @returns {Promise<Object>} Created file details
   */
  static async createBlankFile(driveId, folderId = 'root', fileName) {
    if (!fileName) {
      throw new Error('File name required');
    }
    
    if (!UPLOAD_CONSTANTS.OFFICE_FILE_EXTENSIONS.test(fileName)) {
      throw new Error('File name must end with .docx, .xlsx, or .pptx');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${folderId}:/${encodeURIComponent(fileName)}:/content`;
      
      return await GraphApiClient.put(url, new Blob(['']), {
        'Content-Type': 'application/octet-stream'
      });
    } catch (error) {
      console.error('Error creating blank file:', error);
      throw error;
    }
  }

  /**
   * Create a new folder in a container or folder
   * @param {string} driveId The ID of the drive/container
   * @param {string} folderId The ID of the parent folder (optional, defaults to 'root')
   * @param {string} folderName The name of the folder to create
   * @returns {Promise<Object>} Created folder details
   */
  static async createFolder(driveId, folderId = 'root', folderName) {
    if (!folderName || !folderName.trim()) {
      throw new Error('Folder name required');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${folderId}/children`;
      
      const body = {
        name: folderName.trim(),
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      };

      console.log('Creating folder:', url);
      const result = await GraphApiClient.post(url, body);
      console.log('Create folder result:', result);

      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Rename a drive item (file or folder)
   * @param {string} driveId The ID of the drive/container
   * @param {string} itemId The ID of the item to rename
   * @param {string} newName The new name for the item
   * @returns {Promise<Object>} The updated item object
   */
  static async renameItem(driveId, itemId, newName) {
    if (!newName || !newName.trim()) {
      throw new Error('Item name cannot be empty');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}`;
      const body = { name: newName.trim() };

      console.log('Renaming item:', url, 'to:', newName);
      const result = await GraphApiClient.patch(url, body);
      console.log('Rename item result:', result);

      return result;
    } catch (error) {
      console.error('Error renaming item:', error);
      throw error;
    }
  }

  /**
   * Get file field values (list item fields)
   * @param {string} driveId The ID of the drive
   * @param {string} itemId The ID of the item
   * @returns {Promise<Object>} Field values
   */
  static async getFileFields(driveId, itemId) {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/listItem/fields`;
      return await GraphApiClient.get(url);
    } catch (error) {
      console.error('Error fetching file fields:', error);
      throw error;
    }
  }

  /**
   * Update a file field value
   * @param {string} driveId The ID of the drive
   * @param {string} itemId The ID of the item
   * @param {string} fieldName The name of the field to update
   * @param {*} fieldValue The new field value
   * @returns {Promise<Object>} Updated field values
   */
  static async updateFileField(driveId, itemId, fieldName, fieldValue) {
    if (!fieldName) {
      throw new Error('fieldName required');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/listItem/fields`;
      const body = { [fieldName]: fieldValue };
      
      return await GraphApiClient.patch(url, body);
    } catch (error) {
      console.error('Error updating file field:', error);
      throw error;
    }
  }

  /**
   * Invite (share) a drive item with a user
   * @param {string} driveId The ID of the drive
   * @param {string} itemId The ID of the item
   * @param {string} email Recipient email
   * @param {('read'|'write')} role Access role (read or write)
   * @param {Object} options Optional flags { sendInvitation, message, requireSignIn }
   * @returns {Promise<Object>} Graph invite response
   */
  static async inviteFileAccess(driveId, itemId, email, role = 'read', options = {}) {
    if (!driveId || !itemId) {
      throw new Error('driveId and itemId required');
    }
    if (!email) {
      throw new Error('Recipient email required');
    }

    try {
      const validRole = FILE_SHARING_ROLES.includes(role.toLowerCase()) ? role.toLowerCase() : 'read';
      const { sendInvitation = false, message = null, requireSignIn = true } = options;
      
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/invite`;
      const body = {
        requireSignIn,
        sendInvitation,
        roles: [validRole],
        recipients: [{ email }],
        message
      };

      return await GraphApiClient.post(url, body);
    } catch (error) {
      console.error('Error inviting file access:', error);
      throw error;
    }
  }

  /**
   * List versions for a drive item
   * @param {string} driveId The ID of the drive
   * @param {string} itemId The ID of the item
   * @returns {Promise<Array>} List of versions
   */
  static async listItemVersions(driveId, itemId) {
    if (!driveId || !itemId) {
      throw new Error('driveId and itemId required');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/versions`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error fetching item versions:', error);
      throw error;
    }
  }

  /**
   * Download a drive item as PDF (when supported by Graph for Office docs)
   * @param {string} driveId The ID of the drive
   * @param {string} itemId The ID of the item
   * @returns {Promise<Blob>} PDF blob
   */
  static async downloadItemAsPdf(driveId, itemId) {
    if (!driveId || !itemId) {
      throw new Error('driveId and itemId required');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${driveId}/items/${itemId}/content?format=pdf`;
      const response = await GraphApiClient.fetchRaw(url);
      return await response.blob();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }
}
