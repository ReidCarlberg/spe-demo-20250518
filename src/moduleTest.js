/**
 * This is a test script to verify SharePoint Embedded Copilot Chat imports
 * Run this with Node.js to check if the module can be imported correctly
 */

try {
  console.log('Testing SharePoint Embedded Copilot Chat module import...');
  
  // CommonJS require syntax
  const chatModule = require('@microsoft/sharepointembedded-copilotchat-react');
  console.log('Module required successfully');
  
  // Check available exports
  console.log('Available exports:', Object.keys(chatModule));
  
  // Check if ChatEmbedded is available
  if (chatModule.ChatEmbedded) {
    console.log('ChatEmbedded export found!');
  } else {
    console.error('ChatEmbedded export not found');
  }
  
  // Check if ChatEmbeddedAPI is available
  if (chatModule.ChatEmbeddedAPI) {
    console.log('ChatEmbeddedAPI export found!');
  } else {
    console.error('ChatEmbeddedAPI export not found');
  }
  
  console.log('Module test completed successfully');
} catch (error) {
  console.error('Error importing module:', error);
}
