// This file contains the MSAL configuration parameters
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || "bc6c806c-b008-4bb7-bc9c-9e13f56982c6", 
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || "1f5f7ab1-43d1-4209-aeaf-f9748ede259d"}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Add scopes for the ID token to be used at Microsoft identity platform endpoints
export const loginRequest = {
  scopes: ["User.Read", "Files.ReadWrite.All", "Container.Selected"],
};

// Add endpoints here for Microsoft Graph API services used in your app
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
  graphContainersEndpoint: "https://graph.microsoft.com/v1.0/storage/fileStorage/containers",
  // Beta endpoint used for container type metadata (shape can change)
  graphContainerTypesEndpointBeta: "https://graph.microsoft.com/beta/storage/fileStorage/containerTypes"
};

// SharePoint Embedded Configuration
export const speConfig = {
  containerTypeId: import.meta.env.VITE_CONTAINER_TYPE_ID || "5336f3ca-8810-40f3-b176-392105f4313f"
};

// SharePoint Online Configuration for SPE Copilot Chat
export const spoConfig = {
  spHost: import.meta.env.VITE_SP_HOST || "https://greenwoodeccentrics.sharepoint.com",
  // Request for SPO access token - needed for Copilot Chat control
  spoRequest: {
    scopes: ["https://greenwoodeccentrics.sharepoint.com/Container.Selected"],
    redirectUri: window.location.origin
  }
};
