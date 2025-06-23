import type { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.REACT_APP_CLIENT_ID || 'your-client-id-here',
    authority: `https://login.microsoftonline.com/${import.meta.env.REACT_APP_TENANT_ID || 'your-tenant-id-here'}`,
    redirectUri: import.meta.env.REACT_APP_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
};

export const apiRequest = {
  scopes: [import.meta.env.REACT_APP_API_SCOPE || 'api://your-api-scope/access_as_user'],
};