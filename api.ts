import { getAuth } from "firebase/auth";
import { getToken } from "firebase/app-check";
import { appCheck } from "./src/firebase";

/**
 * Base URL for all backend API requests.
 * In development, Vite intercepts this and proxies it to the local backend.
 * In production, Nginx intercepts this and proxies it to the production backend.
 */
const BASE_URL = "/api";

/**
 * A lightweight wrapper around the native fetch API that automatically
 * prepends the `/api` base URL to your endpoints.
 *
 * @param endpoint - The API route (e.g., '/users' or 'users')
 * @param options - Standard fetch options (method, headers, body, etc.)
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  // Ensure we don't end up with double slashes like '/api//users'
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${BASE_URL}${formattedEndpoint}`;

  // Get the current user's Firebase Auth token (if they are logged in)
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();

  // Initialize a Headers object to safely append the Authorization header
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Safely grab the current App Check token and attach it
  if (appCheck) {
    try {
      const appCheckTokenResult = await getToken(appCheck, false);
      headers.set("X-Firebase-AppCheck", appCheckTokenResult.token);
    } catch (err) {
      console.warn("Failed to retrieve App Check token:", err);
    }
  }

  options.headers = headers;

  const response = await fetch(url, options);

  // Global error handling
  if (!response.ok) {
    if (response.status === 401) {
      console.warn("Unauthorized request (401). Signing out...");
      await auth.signOut();
      window.location.href = "/login"; // Redirect to login
    } else if (response.status === 403) {
      console.warn("Forbidden request (403). Insufficient clearance.");
      // You could trigger a global toast notification or redirect to /403 here
    }

    // Throw an error so the calling component's try/catch block can handle the failure
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
}
