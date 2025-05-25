/**
 * Enhanced SPE service that integrates with the debug mode
 * This creates a proxy around the original speService 
 * that can be used for debugging without modifying the original code.
 */

import { speService } from '../speService';

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

// Just export the original service without any proxy wrapping
// The fetch interceptor will handle capturing the HTTP calls
export const enhancedSpeService = speService;