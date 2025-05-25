/**
 * API Interceptor Module for Debug Mode
 * 
 * This module provides a wrapper around fetch API calls to capture
 * request and response data for debugging purposes.
 */

/**
 * Wraps service methods for debugging without intercepting fetch arguments
 * @param {Function} serviceMethod - The original service method to wrap
 * @param {Function} captureCallData - Function to capture API call data
 * @param {string} methodName - Name of the method being wrapped
 * @returns {Function} Wrapped service method
 */
export const withServiceDebugging = (serviceMethod, captureCallData, methodName) => {
  return async (...args) => {
    // If no capture function provided, just pass through
    if (typeof captureCallData !== 'function') {
      return serviceMethod(...args);
    }

    // Start tracking timing
    const startTime = performance.now();
    
    // Prepare call data object
    const callData = {
      url: `speService.${methodName}()`,
      method: methodName,
      requestHeaders: {},
      requestBody: args.length > 0 ? `Arguments: ${args.length}` : 'No arguments',
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Call the original service method
      const result = await serviceMethod(...args);
      
      // Calculate time taken
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Enhance call data with response info
      callData.status = 200;
      callData.statusText = 'OK';
      callData.duration = duration;
      callData.isError = false;
      callData.responseBody = 'Service method completed successfully';
      
      // Capture the completed call data
      captureCallData(callData);
      
      // Return the original result
      return result;
    } catch (error) {
      // Calculate failure time
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Capture error information
      callData.error = error.message;
      callData.stack = error.stack;
      callData.isError = true;
      callData.duration = duration;
      callData.status = 500;
      callData.statusText = 'Error';
      
      // Record the failed call
      captureCallData(callData);
      
      // Re-throw the original error
      throw error;
    }
  };
};

/**
 * Intercepts and logs API calls when debug mode is active
 * @param {Function} apiCall - The original API function to wrap
 * @param {Function} captureCallData - Function to capture API call data
 * @returns {Function} Wrapped API function
 */
export const withApiDebugging = (apiCall, captureCallData) => {
  return async (...args) => {
    // If no capture function provided, just pass through
    if (typeof captureCallData !== 'function') {
      return apiCall(...args);
    }

    // Extract URL and options from args based on common fetch patterns
    let url, options;
    
    // Handle different argument patterns
    if (args.length === 1) {
      // If only one arg, assume it's the URL
      url = args[0];
      options = {};
    } else if (args.length >= 2) {
      // If two args, assume URL and options
      url = args[0];
      options = args[1] || {};
    }
    
    // If we couldn't determine the URL, just pass through
    if (!url) {
      console.log('⚠️ withApiDebugging: No URL found, passing through', args);
      return apiCall(...args);
    }

    console.log('🔍 Intercepting fetch call:', url, options.method || 'GET');

    // Start tracking timing
    const startTime = performance.now();
    
    // Prepare call data object
    const callData = {
      url,
      method: options.method || 'GET',
      requestHeaders: options.headers || {},
      requestBody: options.body,
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Call the original API function
      const response = await apiCall(...args);
      
      // Calculate time taken
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // If it's a fetch Response, capture relevant data
      if (response instanceof Response) {
        // Clone the response to avoid consuming it
        const clone = response.clone();
        
        // Enhance call data with response info
        callData.status = response.status;
        callData.statusText = response.statusText;
        callData.responseHeaders = Object.fromEntries([...response.headers]);
        callData.duration = duration;
        callData.isError = !response.ok;
        
        // Try to parse the response based on content type
        try {
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            // Parse JSON response
            callData.responseBody = await clone.json();
          } else if (contentType.includes('text/')) {
            // Parse text response
            callData.responseBody = await clone.text();
          } else {
            // For other types, just record the type
            callData.responseBody = `[${contentType}]`;
          }
        } catch (parseError) {
          // If parsing failed, record that
          callData.responseBody = '[Error parsing response body]';
          callData.parseError = parseError.message;
        }
      } else {
        // For non-Response returns, capture whatever we can
        callData.response = typeof response === 'object' 
          ? JSON.parse(JSON.stringify(response)) // Clone to avoid circular refs
          : response;
        callData.duration = duration;
      }
      
      // Capture the completed call data
      captureCallData(callData);
      
      // Return the original response
      return response;
    } catch (error) {
      // Calculate failure time
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Capture error information
      callData.error = error.message;
      callData.stack = error.stack;
      callData.isError = true;
      callData.duration = duration;
      
      // Record the failed call
      captureCallData(callData);
      
      // Re-throw the original error
      throw error;
    }
  };
};

/**
 * Wraps the global fetch API to intercept all fetch calls
 * @param {Function} captureCallData - Function to capture API call data
 * @returns {Function} Function to restore original fetch
 */
export const interceptFetch = (captureCallData) => {
  // Store the original fetch
  const originalFetch = window.fetch;
  
  console.log('🔧 Setting up fetch interceptor for debug mode');
  
  // Replace global fetch with intercepted version
  window.fetch = withApiDebugging(originalFetch, captureCallData);
  
  // Return function to restore original fetch
  return () => {
    console.log('🔧 Removing fetch interceptor');
    window.fetch = originalFetch;
  };
};
