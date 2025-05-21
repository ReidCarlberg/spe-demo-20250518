/**
 * Services exports
 * 
 * This file exports the speService as either the enhanced debug version
 * or the original version based on whether debugging is active.
 * 
 * For future updates, components should import from './services' rather 
 * than directly from './speService' to take advantage of the debug mode.
 */
import { speService as originalService } from '../speService';
import { enhancedSpeService } from '../utils/apiDebugService';

// In this file we re-export the enhanced service as the main service
// This allows us to swap implementations without changing import statements
export const speService = enhancedSpeService;

// Export other services as needed
// export { otherService } from './otherService';