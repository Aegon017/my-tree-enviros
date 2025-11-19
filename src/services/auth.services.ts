import api from "./http-client";

const AUTH_URL = "/"; // Base URL is already set in http-client, these are relative paths

type SignInPayload = { country_code: string; phone: string };
type SignUpPayload = { country_code: string; phone: string; type: string };
type VerifyPayload = { country_code: string; phone: string; otp: string };

export const authService = {
  async signIn(payload: SignInPayload) {
    return await api.post(`${AUTH_URL}sign-in`, payload);
  },

  async signUp(payload: SignUpPayload) {
    return await api.post(`${AUTH_URL}sign-up`, payload);
  },

  async verifyOtp(payload: VerifyPayload) {
    return await api.post<{ user: any; token?: string }>(`${AUTH_URL}verify-otp`, payload);
  },

  async resendOtp(payload: { country_code: string; phone: string }) {
    return await api.post(`${AUTH_URL}resend-otp`, payload);
  },

  async me() {
    return await api.get<{ user: any }>(`${AUTH_URL}me`);
  },

  async signOut(all = false) {
    return await api.post(`${AUTH_URL}sign-out`, all ? { all: true } : undefined);
  },
};