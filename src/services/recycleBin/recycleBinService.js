import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS } from '../shared/constants.js';

/**
 * Service for managing recycle bin operations in SharePoint Embedded containers
 */
export class RecycleBinService {
  /**
   * List items in the recycle bin for a container
   * @param {string} containerId The ID of the container
   * @returns {Promise<Array>} List of recycled items
   */
  static async listRecycleBinItems(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/recycleBin/items`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error fetching recycle bin items:', error);
      throw error;
    }
  }

  /**
   * Permanently delete items from the recycle bin
   * @param {string} containerId The ID of the container
   * @param {string|string[]} recycleBinItemIds The ID(s) of the recycle bin item(s) to permanently delete
   * @returns {Promise<void>}
   */
  static async permanentlyDeleteRecycleBinItem(containerId, recycleBinItemIds) {
    try {
      // Convert single ID to array for consistent handling
      const ids = Array.isArray(recycleBinItemIds) ? recycleBinItemIds : [recycleBinItemIds];
      
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/recycleBin/items/delete`;
      
      await GraphApiClient.post(url, { ids });
    } catch (error) {
      console.error('Error permanently deleting items:', error);
      throw error;
    }
  }

  /**
   * Restore items from the recycle bin
   * @param {string} containerId The ID of the container
   * @param {string|string[]} recycleBinItemIds The ID(s) of the recycle bin item(s) to restore
   * @returns {Promise<Object>} Restore operation result
   */
  static async restoreRecycleBinItem(containerId, recycleBinItemIds) {
    try {
      // Convert single ID to array for consistent handling
      const ids = Array.isArray(recycleBinItemIds) ? recycleBinItemIds : [recycleBinItemIds];
      
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/recycleBin/items/restore`;
      
      return await GraphApiClient.post(url, { ids });
    } catch (error) {
      console.error('Error restoring items:', error);
      throw error;
    }
  }
}
