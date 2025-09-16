import { GraphApiClient } from '../shared/graphApiClient.js';
import { GRAPH_ENDPOINTS, CONTAINER_ROLES } from '../shared/constants.js';

/**
 * Service for managing container permissions
 */
export class ContainerPermissionsService {
  /**
   * Get container permissions
   * @param {string} containerId The ID of the container
   * @returns {Promise<Array>} List of permission objects
   */
  static async getContainerPermissions(containerId) {
    try {
      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/permissions`;
      const data = await GraphApiClient.get(url);
      return data.value || [];
    } catch (error) {
      console.error('Error fetching container permissions:', error);
      throw error;
    }
  }

  /**
   * Grant container permissions to a user
   * @param {string} containerId The ID of the container
   * @param {string} email The email/userPrincipalName of the user to grant permissions to
   * @param {string} role The role to grant (reader, writer, manager, owner)
   * @returns {Promise<Object>} The created permission
   */
  static async grantContainerPermission(containerId, email, role) {
    try {
      // Validate role
      if (!CONTAINER_ROLES.includes(role.toLowerCase())) {
        throw new Error(`Invalid role: ${role}. Must be one of: ${CONTAINER_ROLES.join(', ')}`);
      }

      const url = `${GRAPH_ENDPOINTS.CONTAINERS}/${containerId}/permissions`;
      
      const requestBody = {
        roles: [role.toLowerCase()],
        grantedToV2: {
          user: {
            userPrincipalName: email
          }
        }
      };

      return await GraphApiClient.post(url, requestBody);
    } catch (error) {
      console.error('Error granting container permission:', error);
      throw error;
    }
  }
}
