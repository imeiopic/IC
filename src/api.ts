/**
 * API module - Central point for API calls
 */

export async function apiCall(endpoint: string, options?: RequestInit) {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new ApiError(`API error: ${response.statusText}`, response.status);
  }
  return response.json();
}

export class ApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function callFirebaseFunction(name: string, data?: unknown) {
  return apiCall(`/api/firebase/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {}),
  });
}

export async function apiFetch(endpoint: string, options?: RequestInit) {
  return apiCall(endpoint, options);
}

export default {
  apiCall,
  callFirebaseFunction,
  apiFetch,
  ApiError,
};
