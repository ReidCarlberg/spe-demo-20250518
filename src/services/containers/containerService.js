import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS, QUERY_PARAMS } from '../shared/constants.js';
import { speConfig, graphConfig } from '../../authConfig';

/**
 * Service for managing SharePoint Embedded containers
 */
export class ContainerService {
  /**
   * Get all containers for the configured container type
   * @returns {Promise<Array>} List of containers
   */
  static async getContainers() {
    try {
      const url = `${graphConfig.graphContainersEndpoint}?${QUERY_PARAMS.SELECT_CONTAINER}&$filter=containerTypeId eq ${speConfig.containerTypeId}`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw error;
    }
  }

  /**
   * Create a new container
   * @param {Object} containerData Container creation data
   * @param {string} containerData.displayName Display name for the container
   * @param {string} [containerData.description] Description for the container
   * @param {boolean} [containerData.isOcrEnabled] Whether OCR should be enabled for the container
   * @returns {Promise<Object>} Created container
   */
  static async createContainer(containerData) {
    try {
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

      return await GraphApiClient.post(GRAPH_ENDPOINTS.CONTAINERS, requestBody);
    } catch (error) {
      console.error('Error creating container:', error);
      throw error;
    }
  }

  /**
   * Delete a container
   * @param {string} containerId The ID of the container to delete
   * @returns {Promise<void>}
   */
  static async deleteContainer(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS_BETA}/${containerId}`;
      await GraphApiClient.delete(url);
    } catch (error) {
      console.error('Error deleting container:', error);
      throw error;
    }
  }

  /**
   * Get drive info for a container
   * @param {string} containerId The ID of the container
   * @returns {Promise<Object>} Drive information
   */
  static async getDriveInfo(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/drive`;
      return await GraphApiClient.get(url);
    } catch (error) {
      console.error('Error fetching drive information:', error);
      throw error;
    }
  }

  /**
   * Get container custom properties
   * @param {string} containerId The ID of the container
   * @returns {Promise<Object>} Custom properties
   */
  static async getContainerProperties(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/customProperties`;
      return await GraphApiClient.get(url);
    } catch (error) {
      console.error('Error fetching custom properties:', error);
      throw error;
    }
  }

  /**
   * Add a custom property to a container
   * @param {string} containerId The ID of the container
   * @param {string} name Property name
   * @param {*} value Property value
   * @param {boolean} isSearchable Whether the property is searchable
   * @returns {Promise<Object>} Updated properties
   */
  static async addContainerProperty(containerId, name, value, isSearchable = false) {
    if (!name) {
      throw new Error('Property name required');
    }

    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/customProperties`;
      const body = { 
        [name]: { 
          value, 
          isSearchable: !!isSearchable 
        } 
      };
      
      return await GraphApiClient.patch(url, body);
    } catch (error) {
      console.error('Error adding container property:', error);
      throw error;
    }
  }
}
