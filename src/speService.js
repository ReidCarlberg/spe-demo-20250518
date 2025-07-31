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
      
      // Return the preview URL with the nb=true parameter
      if (data && data.getUrl) {
        return `${data.getUrl}&nb=true`;
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
   * @param {string} containerId The ID of the container to search in
   * @param {string} searchTerm The search term
   * @param {number} limit The maximum number of results to return (optional)
   * @returns {Promise<Array>} Search results
   */
  async searchFiles(containerId, searchTerm, limit = 25) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      // Construct the search URL with the search term and limit
      const url = `https://graph.microsoft.com/v1.0/drives/${containerId}/root/search(q='${encodeURIComponent(searchTerm)}')`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to search files');
      }

      const data = await response.json();
      return data.value || [];
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  },

  /**
   * Advanced Search across SharePoint Embedded using Microsoft Graph Search API
   * @param {Object} searchOptions Search configuration options
   * @param {string[]} searchOptions.entityTypes Entity types to search (drive, driveItem, or both)
   * @param {string} searchOptions.query The search query string
   * @param {string} searchOptions.mode Search mode (term or exact)
   * @param {string[]} [searchOptions.fields] Optional fields to include in results
   * @returns {Promise<Object>} Search results
   */
  async advancedSearch(searchOptions) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const { entityTypes, query, mode, fields } = searchOptions;

      // Validate entity types
      if (!entityTypes || !entityTypes.length) {
        throw new Error('Entity types must be specified');
      }

      let queryString = query;
      
      // If using term mode and containerTypeId is available, append it to the query
      if (mode === 'term' && speConfig.containerTypeId) {
        queryString = `${queryString} AND ContainerTypeId:${speConfig.containerTypeId}`;
      }

      // Construct request body
      const requestBody = {
        requests: [
          {
            entityTypes: entityTypes,
            query: {
              queryString: queryString
            },
            sharePointOneDriveOptions: {
              includeHiddenContent: true
            }
          }
        ]
      };

      // Add fields if specified
      if (fields && fields.length) {
        requestBody.requests[0].fields = fields;
      }

      const url = 'https://graph.microsoft.com/v1.0/search/query';
      
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
        throw new Error(errorData.error?.message || 'Failed to perform search');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  },

  /**
   * Get drive information for a container
   * @param {string} containerId The ID of the container
   * @returns {Promise<Object>} Drive information
   */
  async getDriveInfo(containerId) {
    try {
      const token = await getTokenSilent();
      if (!token) {
        throw new Error('No access token available');
      }

      const url = `https://graph.microsoft.com/v1.0/storage/fileStorage/containers/${containerId}/drive`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch drive information');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching drive information:', error);
      throw error;
    }
  }
};
