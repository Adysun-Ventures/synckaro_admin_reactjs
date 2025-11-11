/**
 * API Client Module
 * 
 * Centralized axios instance with:
 * - Bearer token authentication
 * - Request/response interceptors
 * - Automatic error handling
 * - TypeScript support
 */

export { default as apiClient } from './client';
export { default } from './client';

export {
  setAuthToken,
  clearAuthToken,
  getAuthToken,
} from './client';

export type {
  ApiResponse,
  PaginatedResponse,
  ApiErrorResponse,
  CustomAxiosRequestConfig,
  CustomAxiosError,
} from './types';

