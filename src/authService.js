import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest, spoConfig } from "./authConfig";

// Create the MSAL instance - specify system options for better behavior
export const msalInstance = new PublicClientApplication({
  ...msalConfig,
  system: {
    allowNativeBroker: false,
    windowHashTimeout: 10000,
    iframeHashTimeout: 10000,
    asyncPopups: false
  }
});

// Initialize the MSAL instance with proper error handling
export const initializeMsal = async () => {
  try {
    // Check if already initialized to prevent double initialization
    if (msalInstance.getActiveAccount) {
      console.log("MSAL instance already initialized");
      
      // Still handle any pending redirects
      await msalInstance.handleRedirectPromise().catch((error) => {
        console.error("Redirect error: ", error);
      });
      
      return true;
    }
    
    console.log("Initializing MSAL instance...");
    // Initialize the MSAL application
    await msalInstance.initialize();
    
    // Handle the redirect promise after initialization
    await msalInstance.handleRedirectPromise().catch((error) => {
      console.error("Redirect error: ", error);
    });
    
    console.log("MSAL initialization completed successfully");
    return true;
  } catch (error) {
    console.error("MSAL initialization error:", error);
    // Throw the error to be caught by the calling function
    throw new Error(`MSAL initialization failed: ${error.message}`);
  }
};

// Login function
export const signIn = async () => {
  try {
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

// Logout function
export const signOut = async () => {
  try {
    const logoutRequest = {
      account: getAccount(),
      postLogoutRedirectUri: window.location.origin,
    };
    await msalInstance.logoutPopup(logoutRequest);
  } catch (error) {
    console.error("Logout error:", error);
  }
};


// Get the active account, but only if MSAL is initialized
export const getAccount = () => {
  // Defensive: check for internal _isInitialized property if available
  if (msalInstance && msalInstance._isInitialized === false) {
    return null;
  }
  // If getAllAccounts is not available, MSAL is not ready
  if (!msalInstance.getAllAccounts) {
    return null;
  }
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return null;
  }
  // If there are multiple accounts, choose the first one
  return accounts[0];
};


// Acquire a token silently for Graph API, but only if MSAL is initialized
export const getTokenSilent = async () => {
  // Defensive: check for internal _isInitialized property if available
  if (msalInstance && msalInstance._isInitialized === false) {
    return null;
  }
  if (!msalInstance.getAllAccounts) {
    return null;
  }
  const account = getAccount();
  if (!account) {
    return null;
  }
  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    });
    return response.accessToken;
  } catch (error) {
    // If the silent request fails, try interactive
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (err) {
        console.error("Interactive token acquisition failed:", err);
        return null;
      }
    } else {
      console.error("Silent token acquisition failed:", error);
      return null;
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return getAccount() !== null;
};

/**
 * Request an access token for SharePoint Online specifically for the Copilot Chat control
 * This is separate from the Graph API token - they must use different scopes
 * @returns {Promise<string|null>} SharePoint access token or null if acquisition fails
 */
export const requestSPOAccessToken = async () => {
  console.log("Requesting SPO access token...");
  const account = getAccount();
  if (!account) {
    console.error("No account found when requesting SPO token");
    return null;
  }
  
  console.log("Using SPO scope:", spoConfig.spoRequest.scopes);
  
  try {
    // Important: Use the spoRequest specifically for SPO scopes
    const response = await msalInstance.acquireTokenSilent({
      ...spoConfig.spoRequest,
      account
    });
    console.log("SPO token acquired successfully");
    return response.accessToken;
  } catch (error) {
    // If the silent request fails, try interactive
    if (error instanceof InteractionRequiredAuthError) {
      try {
        const response = await msalInstance.acquireTokenPopup(spoConfig.spoRequest);
        return response.accessToken;
      } catch (err) {
        console.error("Interactive SPO token acquisition failed:", err);
        return null;
      }    } else {
      console.error("Silent SPO token acquisition failed:", error);
      return null;
    }
  }
  
  // For development testing, uncomment to use a mock token
  // console.log("USING MOCK TOKEN FOR DEVELOPMENT");
  // return "mock_spo_token_for_development";
};
