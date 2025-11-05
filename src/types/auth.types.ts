export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  country_code: string;
  type: "individual" | "organization";
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token?: string; 
  };
}

export interface SignUpData {
  country_code: string;
  phone: string;
  type: "individual" | "organization";
  name?: string;
  email?: string;
}

export interface SignInData {
  country_code: string;
  phone: string;
}

export interface VerifyOtpData {
  country_code: string;
  phone: string;
  otp: string;
}

export interface ResendOtpData {
  country_code: string;
  phone: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
