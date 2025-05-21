/**
 * Developer Debug Mode Test
 * 
 * This file demonstrates how to use the debug mode to track API calls during testing.
 * It serves as both an example and a lightweight integration test for the debug mode.
 */

import { speService } from '../services';
import { enableApiDebugging, disableApiDebugging } from '../utils/apiDebugService';

/**
 * Example test function that uses the debug mode to track API calls
 */
const testDebugMode = async () => {
  console.log('Starting Debug Mode Test...');
  
  // Create a mock capture function to track API calls
  const capturedCalls = [];
  const mockCaptureFunction = (callData) => {
    capturedCalls.push(callData);
    console.log(`API Call captured: ${callData.method} ${callData.url}`);
  };
  
  // Enable debug mode with our mock capture function
  console.log('Enabling API debugging...');
  enableApiDebugging(mockCaptureFunction);
  
  try {
    // Make some test API calls
    console.log('Making test API calls...');
    
    // Example 1: List containers
    try {
      console.log('Test call 1: listContainers');
      await speService.listContainers();
      console.log('✅ listContainers call completed');
    } catch (error) {
      console.error('❌ listContainers call failed:', error.message);
    }
    
    // Example 2: Get container
    try {
      console.log('Test call 2: getContainer with mock ID');
      await speService.getContainer('test-container-id');
      console.log('✅ getContainer call completed');
    } catch (error) {
      console.error('❌ getContainer call failed:', error.message);
    }
    
    // Example 3: Search (this might fail which is fine for testing)
    try {
      console.log('Test call 3: search with test query');
      await speService.search('test query', { maxResults: 10 });
      console.log('✅ search call completed');
    } catch (error) {
      console.error('❌ search call failed:', error.message);
    }
    
    // Display results
    console.log('\nTest Results:');
    console.log(`Total API calls captured: ${capturedCalls.length}`);
    
    // Print summary of captured calls
    capturedCalls.forEach((call, index) => {
      console.log(`\nCall ${index + 1}:`);
      console.log(`  Method: ${call.method}`);
      console.log(`  URL: ${call.url}`);
      console.log(`  Status: ${call.status || 'N/A'}`);
      console.log(`  Duration: ${call.duration ? Math.round(call.duration) + 'ms' : 'N/A'}`);
      console.log(`  Success: ${!call.isError}`);
    });
    
  } finally {
    // Always disable debugging when done
    console.log('\nDisabling API debugging...');
    disableApiDebugging();
  }
  
  console.log('Debug Mode Test Complete');
};

/**
 * Helper function to run the test from the browser console
 */
export const runDebugModeTest = () => {
  console.log('Running debug mode integration test...');
  testDebugMode()
    .then(() => console.log('Test completed successfully'))
    .catch(error => console.error('Test failed:', error));
};

// Make it accessible from the browser console
window.runDebugModeTest = runDebugModeTest;

export default testDebugMode;
