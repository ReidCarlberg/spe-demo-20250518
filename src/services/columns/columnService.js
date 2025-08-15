import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS } from '../shared/constants.js';

/**
 * Service for managing container columns (beta features)
 */
export class ColumnService {
  /**
   * List columns for a container
   * @param {string} containerId The ID of the container
   * @returns {Promise<Array>} List of columns
   */
  static async listContainerColumns(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS_BETA}/${containerId}/columns`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error listing container columns:', error);
      throw error;
    }
  }

  /**
   * Create a new column for a container
   * @param {string} containerId The ID of the container
   * @param {Object} columnPayload Column definition payload
   * @returns {Promise<Object>} Created column
   */
  static async createContainerColumn(containerId, columnPayload) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS_BETA}/${containerId}/columns`;
      return await GraphApiClient.post(url, columnPayload);
    } catch (error) {
      console.error('Error creating container column:', error);
      throw error;
    }
  }

  /**
   * Delete a column from a container
   * @param {string} containerId The ID of the container
   * @param {string} columnId The ID of the column to delete
   * @returns {Promise<boolean>} Success indicator
   */
  static async deleteContainerColumn(containerId, columnId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS_BETA}/${containerId}/columns/${columnId}`;
      await GraphApiClient.delete(url);
      return true;
    } catch (error) {
      console.error('Error deleting container column:', error);
      throw error;
    }
  }
}
