import { getAuth, signOut } from 'firebase/auth';
import { getToken } from 'firebase/app-check';
import type { FirebaseApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions'; 
import { auth, appCheck } from '@/firebase';

/**
 * Base URL for all backend API requests.
 * In development, Vite intercepts this and proxies it to the local backend.
 * In production, Nginx intercepts this and proxies it to the production backend.
 */

/**
 * Custom error class for API-related errors, providing structured information.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly responseBody: any;

  constructor(message: string, status: number, statusText: string, responseBody: any = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.responseBody = responseBody;
    Object.setPrototypeOf(this, ApiError.prototype); // Ensures instanceof works correctly
  }
}

/**
 * A wrapper for calling Firebase Cloud Functions with proper error handling and authentication.
 * @param app The FirebaseApp instance.
 * @param functionName The name of the Cloud Function to call.
 * @param data The data payload to send to the function.
 * @returns The result data from the Cloud Function.
 * @throws ApiError if the function call fails.
 */
export async function callFirebaseFunction<TRequest, TResponse>(
  app: FirebaseApp,
  functionName: string,
  data?: TRequest
): Promise<TResponse> {
  try {
    const functions = getFunctions(app);
    const callable = httpsCallable<TRequest, TResponse>(functions, functionName);
    const result = await callable(data);
    return result.data;
  } catch (error: any) {
    console.error(`Firebase Function call failed: ${functionName}`, error);
    // Attempt to parse Firebase Functions error structure
    if (error.code && error.message) {
      throw new ApiError(
        `Cloud Function Error (${error.code}): ${error.message}`,
        error.code, // Use Firebase error code as status
        error.message,
        error.details
      );
    }
    throw new ApiError(
      `Unknown error calling function ${functionName}`,
      500,
      'Unknown Error',
      error
    );
  }
}
const BASE_URL = '/api';

/**
 * A lightweight wrapper around the native fetch API that automatically
 * prepends the `/api` base URL to your endpoints.
 *
 * @param endpoint - The API route (e.g., '/users' or 'users')
 * @param options - Standard fetch options (method, headers, body, etc.)
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  // Ensure we don't end up with double slashes like '/api//users'
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${formattedEndpoint}`;

  // Get the current user's Firebase Auth token (if they are logged in)
  const currentUser = auth.currentUser;
  const token = await currentUser?.getIdToken();

  // Initialize a Headers object to safely append the Authorization header
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Safely grab the current App Check token and attach it
  if (appCheck) {
    try {
      const appCheckTokenResult = await getToken(appCheck, false);
      headers.set('X-Firebase-AppCheck', appCheckTokenResult.token);
    } catch (err) {
      console.warn(
        '[API_FETCH] App Check token retrieval failed. Requests may be blocked by CORS/AppCheck policy.',
        err
      );
    }
  }

  options.headers = headers;

  const response = await fetch(url, options);

  if (!response.ok) {
    let responseBody: any = null;
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseBody = await response.json();
        if (responseBody) {
          // Extract standardized descriptive messages from the backend payload
          errorMessage = responseBody.message || responseBody.error || errorMessage;
        }
      } else {
        responseBody = await response.text();
      }
    } catch (parseError) {
      console.warn('Failed to parse API error response body:', parseError);
    }

    if (response.status === 401) {
      console.warn('Unauthorized request (401). Signing out...');
      await signOut(auth);
      window.location.href = '/login'; // Redirect to login
    }

    // Throw the descriptive ApiError for the caller to handle
    throw new ApiError(errorMessage, response.status, response.statusText, responseBody);
  }
  return response;
}

/**
 * Invokes the secure join protocol via Cloud Functions.
 */
export async function joinInstanceSecurely(instanceId: string, accessCode: string) {
  return callFirebaseFunction<{instanceId: string, accessCode: string}, {success: boolean}>(
    auth.app,
    'joinInstance',
    {
      instanceId,
      accessCode
    }
  );
}

/**
 * Fetches the current state of a Group entity from the substrate.
 */
export async function fetchEntityState(entityId: string) {
  const response = await apiFetch(`/entity/${entityId}`);
  return response.json();
}

/**
 * Commands the collective to realign to the 7.83 Hz baseline.
 */
export async function realignEntity(entityId: string) {
  const response = await apiFetch(`/entity/${entityId}/realign`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * Updates the metabolic pulse for a specific group.
 */
export async function updateEntityPulse(entityId: string, pulseData: { totalPulse: number; localBaseline: number }) {
  const response = await apiFetch(`/entity/${entityId}/pulse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pulseData)
  });
  return response.json();
}
