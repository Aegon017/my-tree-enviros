export const storage = {
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  },
  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  },
  getResendTime: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("otpResendTime");
      return stored ? parseInt(stored) : null;
    }
    return null;
  },
  setResendTime: (time: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("otpResendTime", time.toString());
    }
  },
  clearResendTime: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("otpResendTime");
    }
  },
};
