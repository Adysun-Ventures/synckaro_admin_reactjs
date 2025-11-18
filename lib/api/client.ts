import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { storage } from '@/lib/storage';
import { logout } from '@/services/authService';
import { ApiResponse, ApiErrorResponse, CustomAxiosRequestConfig, CustomAxiosError } from './types';

/**
 * API Base URL Configuration
 * - Uses Next.js API proxy route to avoid CORS issues
 * - Proxy route handles forwarding to actual backend (http://170.187.250.145 or NEXT_PUBLIC_API_URL)
 * - Works on both local development and Netlify deployments
 */
const API_BASE_URL = '/api/proxy';

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * - Adds Bearer token from localStorage to all requests
 * - Skips token if skipAuth flag is set
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const customConfig = config as InternalAxiosRequestConfig & CustomAxiosRequestConfig;

    // Skip auth token if explicitly requested
    if (customConfig.skipAuth) {
      return config;
    }

    // Get auth data from storage
    const authData = storage.getAuth();

    // Add Bearer token if available
    if (authData?.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }

    // Log request in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // Log request error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles successful responses
 * - Transforms error responses
 * - Handles 401/403 with auto-logout
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Log response in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    // Return response data directly if it follows ApiResponse structure
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const customError = error as CustomAxiosError<ApiErrorResponse>;
    const customConfig = error.config as CustomAxiosRequestConfig;

    // Skip error handling if explicitly requested
    if (customConfig?.skipErrorHandling) {
      return Promise.reject(error);
    }

    // Log error in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Response Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Handle network errors
    if (!error.response) {
      const networkError: ApiErrorResponse = {
        success: false,
        error: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    // Handle authentication errors (401 Unauthorized)
    if (status === 401) {
      // Clear auth data and logout (fire and forget)
      void logout();

      // Redirect to login page (only in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }

      const authError: ApiErrorResponse = {
        success: false,
        error: 'Unauthorized',
        message: 'Your session has expired. Please login again.',
        statusCode: 401,
      };
      return Promise.reject(authError);
    }

    // Handle forbidden errors (403 Forbidden)
    if (status === 403) {
      // Redirect to unauthorized page (only in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/unauthorized';
      }

      const forbiddenError: ApiErrorResponse = {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource.',
        statusCode: 403,
      };
      return Promise.reject(forbiddenError);
    }

    // Handle server errors (500+)
    if (status >= 500) {
      const serverError: ApiErrorResponse = {
        success: false,
        error: 'Server Error',
        message: data?.message || 'An internal server error occurred. Please try again later.',
        statusCode: status,
      };
      return Promise.reject(serverError);
    }

    // Handle client errors (400-499)
    const clientError: ApiErrorResponse = {
      success: false,
      error: data?.error || 'Request Error',
      message: data?.message || 'An error occurred while processing your request.',
      statusCode: status,
      errors: data?.errors,
    };
    return Promise.reject(clientError);
  }
);

/**
 * Helper function to manually set token
 * Useful for testing or manual token updates
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    const authData = storage.getAuth();
    if (authData) {
      authData.token = token;
      storage.setAuth(authData);
    }
  }
}

/**
 * Helper function to clear token
 */
export function clearAuthToken(): void {
  // Fire and forget - logout will clear storage even if API call fails
  void logout();
}

/**
 * Helper function to get current token
 */
export function getAuthToken(): string | null {
  const authData = storage.getAuth();
  return authData?.token || null;
}

export default apiClient;

