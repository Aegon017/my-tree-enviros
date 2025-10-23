import api from "@/lib/axios";
import type {
  AuthResponse,
  ResendOtpData,
  SignInData,
  SignUpData,
  VerifyOtpData,
} from "@/types/auth.types";

/**
 * Authentication Service for Sanctum SPA Authentication
 * Uses session-based authentication with httpOnly cookies
 */
export const authService = {
  /**
   * Sign up a new user with phone number
   * Sends OTP to the provided phone number
   */
  signUp: async (data: SignUpData) => {
    const response = await api.post("/sign-up", data);
    return response.data;
  },

  /**
   * Sign in existing user with phone number
   * Sends OTP to the provided phone number
   */
  signIn: async (data: SignInData) => {
    const response = await api.post("/sign-in", data);
    return response.data;
  },

  /**
   * Verify OTP and authenticate user
   * For web: Creates session and sets httpOnly cookies
   * Returns user data (no token for web)
   */
  verifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post<AuthResponse>("/verify-otp", data, {
      headers: {
        "X-Platform": "web", // Important: tells backend to use session auth
      },
    });
    return response.data;
  },

  /**
   * Resend OTP to user's phone number
   */
  resendOtp: async (data: ResendOtpData) => {
    const response = await api.post("/resend-otp", data);
    return response.data;
  },

  /**
   * Logout user
   * For web: Invalidates session and clears cookies
   */
  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  /**
   * Get current authenticated user
   * Uses session authentication
   */
  me: async () => {
    const response = await api.get<AuthResponse>("/me");
    return response.data;
  },

  /**
   * Check if user is authenticated
   * Attempts to fetch current user data
   */
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await api.get<AuthResponse>("/me");
      return response.data.success && !!response.data.data?.user;
    } catch {
      return false;
    }
  },
};
