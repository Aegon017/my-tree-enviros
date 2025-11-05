import api from "@/lib/axios";
import type {
  AuthResponse,
  ResendOtpData,
  SignInData,
  SignUpData,
  VerifyOtpData,
} from "@/types/auth.types";


export const authService = {
  
  signUp: async (data: SignUpData) => {
    const response = await api.post("/sign-up", data);
    return response.data;
  },

  
  signIn: async (data: SignInData) => {
    const response = await api.post("/sign-in", data);
    return response.data;
  },

  
  verifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post<AuthResponse>("/verify-otp", data, {
      headers: {
        "X-Platform": "web", 
      },
    });
    return response.data;
  },

  
  resendOtp: async (data: ResendOtpData) => {
    const response = await api.post("/resend-otp", data);
    return response.data;
  },

  
  logout: async () => {
    const response = await api.post("/logout");
    return response.data;
  },

  
  me: async () => {
    const response = await api.get<AuthResponse>("/me");
    return response.data;
  },

  
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await api.get<AuthResponse>("/me");
      return response.data.success && !!response.data.data?.user;
    } catch {
      return false;
    }
  },
};
