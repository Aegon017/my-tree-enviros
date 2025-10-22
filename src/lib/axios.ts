import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Required for Sanctum SPA
  },
  withCredentials: true, // Essential for Sanctum SPA - sends cookies
});

// CSRF token initialization flag
let csrfInitialized = false;

/**
 * Initialize CSRF token from Laravel Sanctum
 * This must be called before any state-changing requests (POST, PUT, DELETE)
 */
export async function initializeCsrf(): Promise<void> {
  if (csrfInitialized) return;

  try {
    await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/sanctum/csrf-cookie`,
      {
        withCredentials: true,
      },
    );
    csrfInitialized = true;
  } catch (error) {
    console.error("Failed to initialize CSRF token:", error);
    throw error;
  }
}

// Request interceptor - ensures CSRF token is initialized
api.interceptors.request.use(
  async (config) => {
    // For state-changing requests, ensure CSRF token is initialized
    const methodsRequiringCsrf = ["post", "put", "patch", "delete"];
    if (
      config.method &&
      methodsRequiringCsrf.includes(config.method.toLowerCase())
    ) {
      await initializeCsrf();
    }

    // Add X-Platform header for web (helps backend distinguish web from mobile)
    if (!config.headers["X-Platform"]) {
      config.headers["X-Platform"] = "web";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or unauthenticated
      // Reset CSRF initialization flag
      csrfInitialized = false;

      // Only redirect if not already on auth pages
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/sign-in") &&
        !window.location.pathname.startsWith("/sign-up") &&
        !window.location.pathname.startsWith("/verify-otp")
      ) {
        window.location.href = "/sign-in";
      }
    }

    if (error.response?.status === 419) {
      // CSRF token mismatch - reinitialize and retry
      csrfInitialized = false;
    }

    return Promise.reject(error);
  },
);

export default api;
