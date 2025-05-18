import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, loginRequest, spoConfig } from "./authConfig";

// Create the MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Handle the redirect promise and catch any errors
if (msalInstance.getAllAccounts().length === 0) {
  msalInstance.handleRedirectPromise().catch((error) => {
    console.error("Redirect error: ", error);
  });
}

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

// Get the active account
export const getAccount = () => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return null;
  }
  
  // If there are multiple accounts, choose the first one
  return accounts[0];
};

// Acquire a token silently for Graph API
export const getTokenSilent = async () => {
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
