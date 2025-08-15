import { getTokenSilent } from '../../authService';
import { GRAPH_ENDPOINTS, UPLOAD_CONSTANTS } from '../shared/constants.js';

/**
 * Service for handling file uploads to SharePoint Embedded containers
 */
export class FileUploadService {
  /**
   * Simple upload for files smaller than 4MB
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder
   * @param {File} file The file to upload
   * @returns {Promise<Object>} Uploaded file details
   */
  static async simpleUpload(containerId, folderId, file) {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }
    
    const url = `${GRAPH_ENDPOINTS.DRIVES}/${containerId}/items/${folderId}:/${file.name}:/content`;
    
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
  }

  /**
   * Large file upload with progress reporting for files larger than 4MB
   * @param {string} containerId The ID of the container
   * @param {string} folderId The ID of the folder
   * @param {File} file The file to upload
   * @param {Function} onProgress Progress callback function
   * @returns {Promise<Object>} Uploaded file details
   */
  static async largeFileUpload(containerId, folderId, file, onProgress) {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }
    
    // Step 1: Create an upload session
    const createSessionUrl = `${GRAPH_ENDPOINTS.DRIVES}/${containerId}/items/${folderId}:/${file.name}:/createUploadSession`;
    
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
    const chunkSize = UPLOAD_CONSTANTS.CHUNK_SIZE;
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
  }

  /**
   * Get a chunk of a file
   * @param {File} file The file
   * @param {number} start Start byte
   * @param {number} end End byte
   * @returns {Promise<Blob>} File chunk
   */
  static async getFileChunk(file, start, end) {
    return new Promise((resolve) => {
      const chunk = file.slice(start, end + 1);
      resolve(chunk);
    });
  }
}
