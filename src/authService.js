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
    console.log("initializeMsal called, checking current state...");
    console.log("msalInstance:", msalInstance);
    console.log("Current URL:", window.location.href);
    console.log("MSAL config:", msalConfig);
    
    // Ensure initialize() is called exactly once before any other API
    if (!msalInstance._isInitialized) {
      console.log("Initializing MSAL instance...");
      await msalInstance.initialize();
      console.log("MSAL instance.initialize() completed");
    } else {
      console.log("MSAL instance already initialized");
    }
    
    // Handle the redirect promise after initialization
    console.log("Handling redirect promise...");
    const redirectResponse = await msalInstance.handleRedirectPromise();
    console.log("Redirect response:", redirectResponse);

    // Set active account when possible
    if (redirectResponse?.account) {
      msalInstance.setActiveAccount(redirectResponse.account);
    } else {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
      }
    }
    
    console.log("MSAL initialization completed successfully");
    return true;
  } catch (error) {
    console.error("MSAL initialization error:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    // Throw the error to be caught by the calling function
    throw new Error(`MSAL initialization failed: ${error.message}`);
  }
};

// Login function
export const signIn = async () => {
  try {
    // Try popup first (desktop/modern browsers)
    return await msalInstance.loginPopup(loginRequest);
  } catch (error) {
    console.warn("Login popup failed, falling back to redirect:", error && error.message ? error.message : error);
    try {
      // On many mobile browsers popups are blocked — redirect flow is more reliable
      await msalInstance.loginRedirect(loginRequest);
      // loginRedirect will navigate away; in some environments it may return a promise that never resolves here
      return null;
    } catch (redirErr) {
      console.error("Login redirect also failed:", redirErr);
      return null;
    }
  }
};

// Logout function
export const signOut = async () => {
  try {
    const logoutRequest = {
      account: getAccount(),
      postLogoutRedirectUri: window.location.origin,
    };
    try {
      await msalInstance.logoutPopup(logoutRequest);
    } catch (err) {
      console.warn('logoutPopup failed, falling back to logoutRedirect', err);
      try {
        await msalInstance.logoutRedirect(logoutRequest);
      } catch (redirErr) {
        console.error('logoutRedirect failed:', redirErr);
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
};


// Get the active account, but only if MSAL is initialized
export const getAccount = () => {
  // Guard: ensure MSAL initialized
  if (!msalInstance || msalInstance._isInitialized === false) {
    return null;
  }
  // Prefer active account if set
  if (typeof msalInstance.getActiveAccount === 'function') {
    const active = msalInstance.getActiveAccount();
    if (active) return active;
  }
  // Fallback to first account
  if (typeof msalInstance.getAllAccounts !== 'function') {
    return null;
  }
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return null;
  }
  return accounts[0];
};


// Acquire a token silently for Graph API, but only if MSAL is initialized
export const getTokenSilent = async () => {
  // Defensive: check for initialized
  if (!msalInstance || msalInstance._isInitialized === false) {
    return null;
  }
  if (typeof msalInstance.getAllAccounts !== 'function') {
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
        // Try popup (desktop). If popup fails (commonly on mobile), fall back to redirect which is more reliable on mobile.
        try {
          const response = await msalInstance.acquireTokenPopup(loginRequest);
          return response.accessToken;
        } catch (popupErr) {
          console.warn('acquireTokenPopup failed, falling back to acquireTokenRedirect', popupErr);
          try {
            await msalInstance.acquireTokenRedirect(loginRequest);
            return null; // redirect will navigate away
          } catch (redirErr) {
            console.error('acquireTokenRedirect failed:', redirErr);
            return null;
          }
        }
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
        try {
          const response = await msalInstance.acquireTokenPopup(spoConfig.spoRequest);
          return response.accessToken;
        } catch (popupErr) {
          console.warn('SPO acquireTokenPopup failed, falling back to acquireTokenRedirect', popupErr);
          try {
            await msalInstance.acquireTokenRedirect(spoConfig.spoRequest);
            return null;
          } catch (redirErr) {
            console.error('SPO acquireTokenRedirect failed:', redirErr);
            return null;
          }
        }
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
