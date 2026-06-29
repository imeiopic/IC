import { getAuth } from 'firebase/auth';
import { getAppCheck, getToken } from 'firebase/app-check';

/**
 * Helper function to make authenticated requests to Cloud Functions.
 * Automatically attaches Firebase Authentication ID token and App Check token.
 * @param url The URL of the Cloud Function endpoint.
 * @param options Standard RequestInit options for fetch.
 * @returns A Promise that resolves to the Response object from the fetch call.
 */
export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;

  if (!currentUser) throw new Error('User not authenticated for API call.');

  const appCheckInstance = getAppCheck(authInstance.app);
  const [idToken, appCheckTokenResponse] = await Promise.all([
    currentUser.getIdToken(),
    getToken(appCheckInstance, false)
  ]);

  const headers: HeadersInit = {
    ...options?.headers,
    'Authorization': `Bearer ${idToken}`,
    'X-Firebase-AppCheck': appCheckTokenResponse.token
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown Error');
    throw new Error(`API_FRACTURE: ${response.status} - ${errorBody}`);
  }

  return response;
};
