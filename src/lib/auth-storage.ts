import Cookies from "js-cookie";

const TOKEN_KEY = "mte_auth_token";
const USER_KEY = "mte_auth_user";
const RESEND_KEY = "mte_resend_time";

export const authStorage = {
  getToken() {
    return Cookies.get(TOKEN_KEY) || null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  setToken(token: string) {
    Cookies.set(TOKEN_KEY, token, {
      expires: 30,
      sameSite: "Strict",
      secure: true,
    });
  },

  clearToken() {
    Cookies.remove(TOKEN_KEY);
  },

  getUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  clearUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  setResendTime(ts: number) {
    if (typeof window !== "undefined")
      localStorage.setItem(RESEND_KEY, String(ts));
  },

  getResendTime() {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(RESEND_KEY);
    return v ? Number(v) : null;
  },

  clearAll() {
    this.clearToken();
    this.clearUser();
    if (typeof window !== "undefined") localStorage.removeItem(RESEND_KEY);
  },
};
