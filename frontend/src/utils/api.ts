import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get the current auth token from Clerk
 * @returns The authentication token or null if not authenticated
 */
const getAuthToken = async (): Promise<string | null> => {
  try {
    // @ts-ignore - window.Clerk is added by Clerk's script
    const token = await window.Clerk?.session?.getToken();
    return token || null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Custom hook for making authenticated API requests
 * This will automatically include the auth token in requests
 */
export const useApi = () => {
  /**
   * Make an authenticated API request
   * @param method HTTP method
   * @param endpoint API endpoint (without the base URL)
   * @param data Request data (for POST, PUT, PATCH)
   * @param requireAuth Whether authentication is required
   * @returns Promise with response data
   */
  const apiRequest = async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    data?: any,
    requireAuth = true
  ) => {
    try {
      // Get auth token if required
      const token = requireAuth ? await getAuthToken() : null;
      
      // Add auth header if token exists
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Make the request
      const response = await apiClient.request({
        method,
        url: endpoint,
        data,
        headers
      });
      
      return response.data;
    } catch (error) {
      console.error(`API ${method} request to ${endpoint} failed:`, error);
      throw error;
    }
  };
  
  // Return methods for different HTTP verbs
  return {
    get: (endpoint: string, requireAuth = true) => 
      apiRequest('GET', endpoint, undefined, requireAuth),
    post: (endpoint: string, data: any, requireAuth = true) => 
      apiRequest('POST', endpoint, data, requireAuth),
    put: (endpoint: string, data: any, requireAuth = true) => 
      apiRequest('PUT', endpoint, data, requireAuth),
    patch: (endpoint: string, data: any, requireAuth = true) => 
      apiRequest('PATCH', endpoint, data, requireAuth),
    delete: (endpoint: string, requireAuth = true) => 
      apiRequest('DELETE', endpoint, undefined, requireAuth)
  };
};

export default useApi;