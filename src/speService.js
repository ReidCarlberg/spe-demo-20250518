import { getTokenSilent } from './authService';
import { speConfig, graphConfig } from './authConfig';

/**
 * Service to interact with SharePoint Embedded via Microsoft Graph API
 */
export const speService = {
  /**
   * Get all containers for the configured container type
   * @returns {Promise<Array>} List of containers
   */
  async getContainers() {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `${graphConfig.graphContainersEndpoint}?$select=id,displayName,description,containerTypeId,createdDateTime&$filter=containerTypeId eq ${speConfig.containerTypeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch containers');
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  },

  /**
   * Create a new container
   * @param {Object} containerData Container creation data
   * @param {string} containerData.displayName Display name for the container
   * @param {string} [containerData.description] Description for the container
   * @param {boolean} [containerData.isOcrEnabled] Whether OCR should be enabled for the container
   * @returns {Promise<Object>} Created container
   */
  async createContainer(containerData) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const requestBody = {
        displayName: containerData.displayName,
        description: containerData.description || '',
        containerTypeId: speConfig.containerTypeId
      };

      // Add OCR settings if specified
      if (containerData.hasOwnProperty('isOcrEnabled')) {
        requestBody.settings = {
          isOcrEnabled: containerData.isOcrEnabled
        };
      }

      const response = await fetch('https://graph.microsoft.com/v1.0/storage/fileStorage/containers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create container');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  },

  /**
   * List files and folders in a container or folder
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder (optional, defaults to 'root')
   * @returns {Promise<Array>} List of files and folders
   */
  async listFiles(containerId, folderId = 'root') {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      let url = `https://graph.microsoft.com/v1.0/drives/${containerId}/items/${folderId}/children?$expand=listItem($expand=fields)`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch files');
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  },
  /**
   * Get details of a specific file or folder
   * @param {string} containerId The ID of the container
   * @param {string} itemId The ID of the file or folder
   * @returns {Promise<Object>} File or folder details
   */
  async getFileDetails(containerId, itemId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/v1.0/drives/${containerId}/items/${itemId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch file details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching file details:', error);
      throw error;
    }
  },
  
  /**
   * Upload a file to a container or folder
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder (optional, defaults to 'root')
   * @param {File} file The file to upload
   * @param {Function} onProgress Progress callback function (optional)
   * @returns {Promise<Object>} Uploaded file details
   */
  async uploadFile(containerId, folderId, file, onProgress) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // For files smaller than 4MB, use simple upload
      if (file.size <= 4 * 1024 * 1024) {
        return await this.simpleUpload(containerId, folderId, file);
      } else {
        // For larger files, use large file upload with progress reporting
        return await this.largeFileUpload(containerId, folderId, file, onProgress);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Simple upload for files smaller than 4MB
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder
   * @param {File} file The file to upload
   * @returns {Promise<Object>} Uploaded file details
   */
  async simpleUpload(containerId, folderId, file) {
    const token = await getTokenSilent();
    
    const url = `https://graph.microsoft.com/v1.0/drives/${containerId}/items/${folderId}:/${file.name}:/content`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload file');
    }

    return await response.json();
  },

  /**
   * Large file upload with progress reporting for files larger than 4MB
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder
   * @param {File} file The file to upload
   * @param {Function} onProgress Progress callback function
   * @returns {Promise<Object>} Uploaded file details
   */
  async largeFileUpload(containerId, folderId, file, onProgress) {
    const token = await getTokenSilent();
    
    // Step 1: Create an upload session
    const createSessionUrl = `https://graph.microsoft.com/v1.0/drives/${containerId}/items/${folderId}:/${file.name}:/createUploadSession`;
    
    const createSessionResponse = await fetch(createSessionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        item: {
          '@microsoft.graph.conflictBehavior': 'replace'
        }
      })
    });

    if (!createSessionResponse.ok) {
      const errorData = await createSessionResponse.json();
      throw new Error(errorData.error?.message || 'Failed to create upload session');
    }

    const sessionData = await createSessionResponse.json();
    const uploadUrl = sessionData.uploadUrl;

    // Step 2: Upload the file in chunks
    const chunkSize = 4 * 1024 * 1024; // 4MB chunks
    const fileSize = file.size;
    let bytesUploaded = 0;
    let result = null;

    while (bytesUploaded < fileSize) {
      const start = bytesUploaded;
      const end = Math.min(fileSize, start + chunkSize) - 1;
      
      const chunk = await this.getFileChunk(file, start, end);
      
      const chunkResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': `${end - start + 1}`
        },
        body: chunk
      });

      if (chunkResponse.status === 202) {
        // Chunk uploaded successfully, but not complete
        bytesUploaded = end + 1;
        
        if (onProgress) {
          onProgress(bytesUploaded / fileSize);
        }
      } else if (chunkResponse.status === 200 || chunkResponse.status === 201) {
        // Upload completed
        bytesUploaded = fileSize;
        result = await chunkResponse.json();
        
        if (onProgress) {
          onProgress(1);
        }
      } else {
        const errorData = await chunkResponse.json();
        throw new Error(errorData.error?.message || 'Failed to upload file chunk');
      }
    }

    return result;
  },
  /**
   * Get a chunk of a file
   * @param {File} file The file
   * @param {number} start Start byte
   * @param {number} end End byte
   * @returns {Promise<Blob>} File chunk
   */
  async getFileChunk(file, start, end) {
    return new Promise((resolve) => {
      const chunk = file.slice(start, end + 1);
      resolve(chunk);
    });
  },
  
  /**
   * Get a preview URL for a file (especially non-Office documents like PDF, JPEG, etc.)
   * @param {string} driveId The ID of the drive (container)
   * @param {string} itemId The ID of the file
   * @returns {Promise<string>} The preview URL
   */
  async getFilePreviewUrl(driveId, itemId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/preview`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get preview URL');
      }

      const data = await response.json();
      
      console.log('Preview API response:', data); // Debug log
      
      // Return the preview URL with the nb=true parameter
      if (data && data.getUrl) {
        const previewUrl = `${data.getUrl}&nb=true`;
        console.log('Generated preview URL:', previewUrl); // Debug log
        return previewUrl;
      } else {
        throw new Error('Preview URL not found in the response');
      }
    } catch (error) {
      console.error('Error getting preview URL:', error);
      throw error;
    }
  },

  /**
   * Delete a file or folder (DriveItem) from a container
   * @param {string} driveId The ID of the container (drive)
   * @param {string} itemId The ID of the file or folder to delete
   * @returns {Promise<void>}
   */
  async deleteFile(driveId, itemId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Special handling for 204 No Content which is a success code for DELETE
        if (response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete file');
        }
      }

      // DELETE operations typically don't return a response body
      return;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  /**
   * Delete a container
   * @param {string} containerId The ID of the container to delete
   * @returns {Promise<void>}
   */
  async deleteContainer(containerId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/beta/storage/fileStorage/containers/${containerId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Special handling for 204 No Content which is a success code for DELETE
        if (response.status !== 204) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Failed to delete container');
        }
      }

      // DELETE operations typically don't return a response body
      return;
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  },

  /**
   * Get container permissions
   * @param {string} containerId The ID of the container
   * @returns {Promise<Array>} List of permission objects
   */
  async getContainerPermissions(containerId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/permissions`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch container permissions');
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching container permissions:', error);
      throw error;
    }
  },

  /**
   * Grant container permissions to a user
   * @param {string} containerId The ID of the container
   * @param {string} email The email/userPrincipalName of the user to grant permissions to
   * @param {string} role The role to grant (reader, writer, manager, owner)
   * @returns {Promise<Object>} The created permission
   */
  async grantContainerPermission(containerId, email, role) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // Validate role - must be one of these values
      const validRoles = ['reader', 'writer', 'manager', 'owner'];
      if (!validRoles.includes(role.toLowerCase())) {
        throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
      }

      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/permissions`;
      
      const requestBody = {
        roles: [role.toLowerCase()],
        grantedToV2: {
          user: {
            userPrincipalName: email
          }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to grant container permission');
      }

      return await response.json();
    } catch (error) {
      console.error('Error granting container permission:', error);
      throw error;
    }
  },

  /**
   * Search for files in a container
   * @param {string} containerId
   * @param {string} searchTerm
   * @param {number} limit
   */
  async searchFiles(containerId, searchTerm, limit = 25) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      const url = `https://graph.microsoft.com/v1.0/drives/${containerId}/root/search(q='${encodeURIComponent(searchTerm)}')`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to search files');
      }
      const data = await response.json();
      return data.value || [];
    } catch (e) { console.error('Error searching files:', e); throw e; }
  },

  /**
   * Create blank Office file
   */
  async createBlankFile(driveId, folderId = 'root', fileName) {
    if (!fileName) throw new Error('File name required');
    if (!/\.(docx|xlsx|pptx)$/i.test(fileName)) throw new Error('File name must end with .docx, .xlsx, or .pptx');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}:/${encodeURIComponent(fileName)}:/content`;
    const resp = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, body: new Blob(['']) });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to create file'); }
    return await resp.json();
  },

  /**
   * Create a new folder in a container or folder
   * @param {string} driveId The ID of the drive/container
   * @param {string} folderId The ID of the parent folder (optional, defaults to 'root')
   * @param {string} folderName The name of the folder to create
   * @returns {Promise<Object>} Created folder details
   */
  async createFolder(driveId, folderId = 'root', folderName) {
    try {
      if (!folderName || !folderName.trim()) {
        throw new Error('Folder name required');
      }

      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // Construct the API URL
      const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${folderId}/children`;

      // Construct the body of the POST request
      const body = {
        name: folderName.trim(),
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      };

      console.log('Creating folder:', url);

      // Make the POST request to the Microsoft Graph API
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create folder');
      }

      const result = await response.json();
      console.log('Create folder result:', result);

      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  },

  /**
   * Rename a drive item (file or folder)
   * @param {string} driveId The ID of the drive/container
   * @param {string} itemId The ID of the item to rename
   * @param {string} newName The new name for the item
   * @returns {Promise<Object>} The updated item object
   */
  async renameItem(driveId, itemId, newName) {
    try {
      if (!newName || !newName.trim()) {
        throw new Error('Item name cannot be empty');
      }

      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // Construct the API URL
      const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}`;

      // Construct the body of the PATCH request
      const body = {
        name: newName.trim()
      };

      console.log('Renaming item:', url, 'to:', newName);

      // Make the PATCH request to the Microsoft Graph API
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to rename item');
      }

      const result = await response.json();
      console.log('Rename item result:', result);

      return result;
    } catch (error) {
      console.error('Error renaming item:', error);
      throw error;
    }
  },

  /** Advanced Search (Graph search/query) */
  async advancedSearch(searchOptions) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      const { entityTypes, query, mode, fields } = searchOptions;
      if (!entityTypes || !entityTypes.length) throw new Error('Entity types must be specified');
      let queryString = query;
      if (mode === 'term' && speConfig.containerTypeId) {
        queryString = `${queryString} AND ContainerTypeId:${speConfig.containerTypeId}`;
      }
      const body = { requests: [{ entityTypes, query: { queryString }, sharePointOneDriveOptions: { includeHiddenContent: true } }] };
      if (fields && fields.length) body.requests[0].fields = fields;
      const resp = await fetch('https://graph.microsoft.com/v1.0/search/query', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!resp.ok) { const err = await resp.json(); throw new Error(err.error?.message || 'Failed to perform search'); }
      return await resp.json();
    } catch (e) { console.error('Error performing advanced search:', e); throw e; }
  },

  /** Get drive info */
  async getDriveInfo(containerId) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/drive`;
      const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!resp.ok) { const err = await resp.json(); throw new Error(err.error?.message || 'Failed to fetch drive information'); }
      return await resp.json();
    } catch (e) { console.error('Error fetching drive information:', e); throw e; }
  },

  /** Container custom properties */
  async getContainerProperties(containerId) {
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/customProperties`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to fetch custom properties'); }
    return await resp.json();
  },
  async addContainerProperty(containerId, name, value, isSearchable = false) {
    if (!name) throw new Error('Property name required');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/customProperties`;
    const body = { [name]: { value, isSearchable: !!isSearchable } };
    const resp = await fetch(url, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to add property'); }
    return await resp.json();
  },

  // Container column definition methods (beta)
  async listContainerColumns(containerId) {
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/beta/storage/fileStorage/containers/${containerId}/columns`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to list columns'); }
    const data = await resp.json();
    return data.value || [];
  },
  async createContainerColumn(containerId, columnPayload) {
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/beta/storage/fileStorage/containers/${containerId}/columns`;
    const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(columnPayload) });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to create column'); }
    return await resp.json();
  },
  async deleteContainerColumn(containerId, columnId) {
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/beta/storage/fileStorage/containers/${containerId}/columns/${columnId}`;
    const resp = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok && resp.status !== 204) {
      let msg = 'Failed to delete column';
      try { const err = await resp.json(); msg = err.error?.message || msg; } catch {}
      throw new Error(msg);
    }
    return true;
  },

  // File (DriveItem) list item field values
  async getFileFields(driveId, itemId) {
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/listItem/fields`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to fetch file fields'); }
    return await resp.json();
  },
  async updateFileField(driveId, itemId, fieldName, fieldValue) {
    if (!fieldName) throw new Error('fieldName required');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/listItem/fields`;
    const body = { [fieldName]: fieldValue };
    const resp = await fetch(url, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) { const err = await resp.json().catch(()=>({})); throw new Error(err.error?.message || 'Failed to update field'); }
    return await resp.json();
  },

  /**
   * Invite (share) a drive item with a user.
   * @param {string} driveId
   * @param {string} itemId
   * @param {string} email Recipient email
   * @param {('read'|'write')} role Access role (read or write)
   * @param {Object} options Optional flags { sendInvitation, message, requireSignIn }
   * @returns {Promise<Object>} Graph invite response
   */
  async inviteFileAccess(driveId, itemId, email, role = 'read', options = {}) {
    if (!driveId || !itemId) throw new Error('driveId and itemId required');
    if (!email) throw new Error('Recipient email required');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const validRole = role.toLowerCase() === 'write' ? 'write' : 'read';
    const { sendInvitation = false, message = null, requireSignIn = true } = options;
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/invite`;
    const body = {
      requireSignIn,
      sendInvitation,
      roles: [validRole],
      recipients: [{ email }],
      message
    };
    const resp = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!resp.ok) { let msg = 'Failed to invite user'; try { const err = await resp.json(); msg = err.error?.message || msg; } catch {} throw new Error(msg); }
    return await resp.json();
  },

  /** List versions for a drive item */
  async listItemVersions(driveId, itemId) {
    if (!driveId || !itemId) throw new Error('driveId and itemId required');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/versions`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
    if (!resp.ok) { let msg = 'Failed to fetch versions'; try { const err = await resp.json(); msg = err.error?.message || msg; } catch {} throw new Error(msg); }
    const data = await resp.json();
    return data.value || [];
  },

  /** Download a drive item as PDF (when supported by Graph for Office docs) */
  async downloadItemAsPdf(driveId, itemId) {
    if (!driveId || !itemId) throw new Error('driveId and itemId required');
    const token = await getTokenSilent();
    if (!token) throw new Error('No access token available');
    const url = `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/content?format=pdf`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) {
      let msg = 'Failed to download PDF';
      try { const err = await resp.json(); msg = err.error?.message || msg; } catch {}
      throw new Error(msg);
    }
    const blob = await resp.blob();
    return blob;
  },

  // Recycle bin operations
  /**
   * List items in the recycle bin for a container
   * @param {string} containerId The ID of the container
   * @returns {Promise<Array>} List of recycled items
   */
  async listRecycleBinItems(containerId) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      
      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/recycleBin/items`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch recycle bin items');
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error fetching recycle bin items:', error);
      throw error;
    }
  },

  /**
   * Permanently delete items from the recycle bin
   * @param {string} containerId The ID of the container
   * @param {string|string[]} recycleBinItemIds The ID(s) of the recycle bin item(s) to permanently delete
   * @returns {Promise<void>}
   */
  async permanentlyDeleteRecycleBinItem(containerId, recycleBinItemIds) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      
      // Convert single ID to array for consistent handling
      const ids = Array.isArray(recycleBinItemIds) ? recycleBinItemIds : [recycleBinItemIds];
      
      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/recycleBin/items/delete`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: ids
        })
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to permanently delete items');
      }
    } catch (error) {
      console.error('Error permanently deleting items:', error);
      throw error;
    }
  },

  /**
   * Restore items from the recycle bin
   * @param {string} containerId The ID of the container
   * @param {string|string[]} recycleBinItemIds The ID(s) of the recycle bin item(s) to restore
   * @returns {Promise<Object>} Restore operation result
   */
  async restoreRecycleBinItem(containerId, recycleBinItemIds) {
    try {
      const token = await getTokenSilent();
      if (!token) throw new Error('No access token available');
      
      // Convert single ID to array for consistent handling
      const ids = Array.isArray(recycleBinItemIds) ? recycleBinItemIds : [recycleBinItemIds];
      
      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/recycleBin/items/restore`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: ids
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to restore items');
      }

      return await response.json();
    } catch (error) {
      console.error('Error restoring items:', error);
      throw error;
    }
  }
};
