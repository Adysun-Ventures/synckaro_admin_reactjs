import { storage } from '@/lib/storage';
import { AuthData, OTPVerifyData } from '@/types';

/**
 * Authentication Service for SyncKaro Admin
 * Handles mobile + OTP authentication with localStorage
 */

// Dummy admin credentials
const DUMMY_ADMIN = {
  mobile: '9999999999',
  otp: '1234',
  user: {
    id: 'admin-1',
    name: 'Admin',
    mobile: '9999999999',
    role: 'admin' as const,
    email: 'admin@synckaro.com',
  },
};

/**
 * Validate Indian mobile number (10 digits)
 */
function isValidMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

/**
 * Send OTP to mobile number
 * @param mobile - 10-digit Indian mobile number
 * @returns Promise with success status
 */
export async function sendOTP(mobile: string): Promise<{ success: boolean; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Validate mobile number
  if (!isValidMobile(mobile)) {
    return {
      success: false,
      error: 'Please enter a valid 10-digit mobile number',
    };
  }

  // In production, this would call the backend API
  // For now, we just return success for any valid mobile
  return { success: true };
}

/**
 * Verify OTP for given mobile number
 * @param data - Mobile and OTP
 * @returns Promise with auth data or error
 */
export async function verifyOTP(data: OTPVerifyData): Promise<{ success: boolean; error?: string; data?: AuthData }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const { mobile, otp } = data;

  // Check dummy admin credentials
  if (mobile === DUMMY_ADMIN.mobile && otp === DUMMY_ADMIN.otp) {
    const authData: AuthData = {
      user: DUMMY_ADMIN.user,
      token: `dummy-token-${Date.now()}`,
      isAuthenticated: true,
    };

    // Store in localStorage
    storage.setAuth(authData);

    return {
      success: true,
      data: authData,
    };
  }

  // In production, this would verify with backend
  // For now, reject any other credentials
  return {
    success: false,
    error: 'Invalid OTP. Please try again.',
  };
}

/**
 * Resend OTP to mobile number
 * @param mobile - 10-digit Indian mobile number
 * @returns Promise with success status
 */
export async function resendOTP(mobile: string): Promise<{ success: boolean; error?: string }> {
  // Reuse sendOTP logic
  return sendOTP(mobile);
}

/**
 * Logout current user
 */
export function logout(): void {
  storage.clearAuth();
}

/**
 * Check if user is authenticated
 * @returns boolean indicating auth status
 */
export function isAuthenticated(): boolean {
  const auth = storage.getAuth();
  return auth?.isAuthenticated || false;
}

/**
 * Get current authenticated user
 * @returns User object or null
 */
export function getCurrentUser() {
  const auth = storage.getAuth();
  return auth?.user || null;
}

