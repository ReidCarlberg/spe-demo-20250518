import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS, SEARCH_ENTITY_TYPES } from '../shared/constants.js';
import { speConfig } from '../../authConfig';

/**
 * Service for searching files in SharePoint Embedded containers
 */
export class FileSearchService {
  /**
   * Search for files in a container
   * @param {string} containerId The ID of the container
   * @param {string} searchTerm The search term
   * @param {number} limit Maximum number of results (optional, defaults to 25)
   * @returns {Promise<Array>} List of search results
   */
  static async searchFiles(containerId, searchTerm, limit = 25) {
    try {
      const url = `${GRAPH_ENDPOINTS.DRIVES}/${containerId}/root/search(q='${encodeURIComponent(searchTerm)}')`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  /**
   * Advanced Search using Graph search/query endpoint
   * @param {Object} searchOptions Search configuration
   * @param {Array} searchOptions.entityTypes Array of entity types to search
   * @param {string} searchOptions.query Search query string
   * @param {string} searchOptions.mode Search mode ('term' or other)
   * @param {Array} searchOptions.fields Fields to return (optional)
   * @returns {Promise<Object>} Search results
   */
  static async advancedSearch(searchOptions) {
    try {
      const { entityTypes, query, mode, fields } = searchOptions;
      
      if (!entityTypes || !entityTypes.length) {
        throw new Error('Entity types must be specified');
      }

      let queryString = query;
      if (mode === 'term' && speConfig.containerTypeId) {
        queryString = `${queryString} AND ContainerTypeId:${speConfig.containerTypeId}`;
      }

      const body = { 
        requests: [{ 
          entityTypes, 
          query: { queryString }, 
          sharePointOneDriveOptions: { 
            includeHiddenContent: true 
          } 
        }] 
      };

      if (fields && fields.length) {
        body.requests[0].fields = fields;
      }

      return await GraphApiClient.post(GRAPH_ENDPOINTS.SEARCH, body);
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }
}
