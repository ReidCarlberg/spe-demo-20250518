/**
 * Utility functions for handling authentication across new tabs
 */

/**
 * Retrieves a temporary auth token from the URL query parameters
 * and attempts to use it for the current session.
 * 
 * This should be called when the application initializes.
 * 
 * @returns {string|null} The retrieved token or null if not found
 */
export const retrieveAuthFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tabId = urlParams.get('authTabId');
    
    if (tabId) {
      // Get the token from sessionStorage using the tabId
      const token = sessionStorage.getItem(tabId);
      
      if (token) {
        // Clean up the temporary token
        sessionStorage.removeItem(tabId);
        
        // The token should be used to set up the authentication state
        // However, since MSAL handles this via sessionStorage already,
        // we don't need to do anything else here
        
        // Remove the authTabId from the URL without reloading the page
        const newUrl = window.location.pathname + 
          window.location.search.replace(/([&?])authTabId=[^&]+(&|$)/g, '$1').replace(/[?&]$/,'');
        window.history.replaceState({}, document.title, newUrl);
        
        return token;
      }
    }
  } catch (error) {
    console.error('Error retrieving auth token from URL:', error);
  }
  
  return null;
};

/**
 * Creates a URL with a temporary auth token for opening in a new tab
 * 
 * @param {string} path - The path to navigate to
 * @param {string} token - The access token to pass to the new tab
 * @returns {string} URL with auth token information
 */
export const createNewTabUrl = (path, token) => {
  if (!token) return path;
  
  // Create a temporary token in sessionStorage that can be accessed by the new tab
  const tabId = `tab_auth_${Date.now()}`;
  try {
    // Store the token in sessionStorage with the temporary key
    sessionStorage.setItem(tabId, token);
    
    // Add the tabId as a query parameter so the new tab can retrieve the token
    return `${path}${path.includes('?') ? '&' : '?'}authTabId=${tabId}`;
  } catch (err) {
    console.error('Failed to store temporary auth token:', err);
    return path;
  }
};
