import { speService } from '../speService';
import { interceptFetch, withApiDebugging } from './apiInterceptor';

/**
 * Creates a wrapped version of the SPE service that logs API calls for debugging
 * @param {Function} captureApiCall - Function to capture API call data
 * @returns {Object} Wrapped SPE service
 */
export const createDebugSpeService = (captureApiCall) => {
  // Create a new service object with wrapped methods
  const wrappedService = { ...speService };
  
  // Wrap all methods in the service
  Object.keys(speService).forEach(key => {
    if (typeof speService[key] === 'function') {
      wrappedService[key] = withApiDebugging(speService[key], captureApiCall);
    }
  });
  
  return wrappedService;
};

/**
 * Sets up the global fetch interceptor for debug mode
 * @param {Function} captureApiCall - Function to capture API call data
 * @returns {Function} Function to remove the interceptor
 */
export const setupApiDebugger = (captureApiCall) => {
  // Intercept global fetch API
  return interceptFetch(captureApiCall);
};