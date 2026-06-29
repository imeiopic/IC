// Google Drive Invitation Detection Utility
// Production-ready: Handles OAuth2, file search, and file reading
// Usage: import { getInvitationFromDrive, ensureGapiLoaded } from './googleDriveInvitation'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
// const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || ''; // Not used in frontend
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/drive.readwrite.file';

// Loads the Google API client library
export async function ensureGapiLoaded(): Promise<void> {
  if (typeof window.gapi === 'undefined') {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  await new Promise((resolve) => {
    window.gapi.load('client:auth2', resolve);
  });
}

// Authenticates the member and initializes the Drive API
export async function authenticateWithDrive(): Promise<void> {
  await window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  });
  const authInstance = window.gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn();
  }
}

// Searches for an invitation file in the member's Drive
export async function getInvitationFromDrive(): Promise<string | null> {
  // Example: Look for a file named 'IOPIC-INVITATION.txt' in root
  const response = await window.gapi.client.drive.files.list({
    q: "name = 'IOPIC-INVITATION.txt' and trashed = false",
    fields: 'files(id, name)',
    spaces: 'drive',
    pageSize: 1,
  });
  const files = response.result.files;
  if (!files || files.length === 0) return null;
  const fileId = files[0].id;
  // Read the file content
  const fileContentResp = await window.gapi.client.drive.files.get({
    fileId,
    alt: 'media',
  });
  // Assume inviter's name is the first line
  const content = fileContentResp.body as string;
  const inviter = content.split('\n')[0].trim();
  return inviter || null;
}

// Handles Google OAuth2 redirect after authentication
export function handleOAuthRedirect() {
  const params = new URLSearchParams(window.location.search);
  // If code param exists, Google redirected here after auth
  if (window.location.pathname.endsWith('/oauth2callback') && params.has('code')) {
    // Optionally, you can exchange the code for tokens here if needed
    // For SPA, Google handles this internally, so just redirect to homepage or dashboard
    window.location.replace('/');
  }
}
