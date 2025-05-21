/**
 * Enhanced SPE service that integrates with the debug mode
 * This creates a proxy around the original speService 
 * that can be used for debugging without modifying the original code.
 */

import { speService } from '../speService';
import { withApiDebugging } from './apiInterceptor';

let debuggingEnabled = false;
let captureCallFn = null;

/**
 * Enable API call debugging
 * @param {Function} captureCall Function to capture API calls
 */
export const enableApiDebugging = (captureCall) => {
  debuggingEnabled = true;
  captureCallFn = captureCall;
};

/**
 * Disable API call debugging
 */
export const disableApiDebugging = () => {
  debuggingEnabled = false;
  captureCallFn = null;
};

/**
 * Creates a proxy handler for the SPE service
 * This intercepts method calls and wraps them with debugging if enabled
 */
const serviceProxyHandler = {
  get: (target, prop) => {
    // Get the original property
    const originalProp = target[prop];
    
    // If it's not a function or debugging is disabled, return as is
    if (typeof originalProp !== 'function' || !debuggingEnabled || !captureCallFn) {
      return originalProp;
    }
    
    // Return a wrapped version of the function
    return withApiDebugging(originalProp, captureCallFn);
  }
};

// Create a proxy around the original speService
export const enhancedSpeService = new Proxy(speService, serviceProxyHandler);