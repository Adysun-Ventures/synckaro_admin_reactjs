import { AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Standard API Response Wrapper
 * All successful API responses follow this structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Extended Axios Request Config
 * Allows custom properties for request handling
 */
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean; // Skip adding bearer token
  skipErrorHandling?: boolean; // Skip automatic error handling
}

/**
 * Extended Axios Error with API error details
 * Note: AxiosError already has the response property, this is just for type convenience
 */
export type CustomAxiosError<T = ApiErrorResponse> = AxiosError<T>;

