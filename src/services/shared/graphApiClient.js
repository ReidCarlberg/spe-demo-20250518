import { getTokenSilent } from '../../authService';

/**
 * Base Graph API client with common functionality
 */
export class GraphApiClient {
  /**
   * Get authorization headers
   * @returns {Promise<Object>} Authorization headers
   */
  static async getAuthHeaders() {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Make a GET request to Graph API
   * @param {string} url The API endpoint URL
   * @returns {Promise<Object>} Response data
   */
  static async get(url) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    return this.handleResponse(response);
  }

  /**
   * Make a POST request to Graph API
   * @param {string} url The API endpoint URL
   * @param {Object} body Request body
   * @returns {Promise<Object>} Response data
   */
  static async post(url, body = null) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : null
    });

    return this.handleResponse(response);
  }

  /**
   * Make a PUT request to Graph API
   * @param {string} url The API endpoint URL
   * @param {Object|Blob} body Request body
   * @param {Object} customHeaders Custom headers to override defaults
   * @returns {Promise<Object>} Response data
   */
  static async put(url, body = null, customHeaders = {}) {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...customHeaders
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body
    });

    return this.handleResponse(response);
  }

  /**
   * Make a PATCH request to Graph API
   * @param {string} url The API endpoint URL
   * @param {Object} body Request body
   * @returns {Promise<Object>} Response data
   */
  static async patch(url, body) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  }

  /**
   * Make a DELETE request to Graph API
   * @param {string} url The API endpoint URL
   * @returns {Promise<void>}
   */
  static async delete(url) {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'DELETE request failed');
    }
  }

  /**
   * Handle API response
   * @param {Response} response Fetch response
   * @returns {Promise<Object>} Response data
   */
  static async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  /**
   * Make a raw fetch request (for non-JSON responses like file downloads)
   * @param {string} url The API endpoint URL
   * @param {Object} options Fetch options
   * @returns {Promise<Response>} Raw response
   */
  static async fetchRaw(url, options = {}) {
    const token = await getTokenSilent();
    if (!token) {
      throw new Error('No access token available');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }
}
