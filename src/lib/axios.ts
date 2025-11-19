import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});


let csrfInitialized = false;


export async function initializeCsrf(): Promise<void> {
  if (csrfInitialized) return;

  try {
    await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    );
    csrfInitialized = true;
  } catch (error) {
    console.error("Failed to initialize CSRF token:", error);
    throw error;
  }
}


api.interceptors.request.use(
  async (config) => {
    
    const methodsRequiringCsrf = ["post", "put", "patch", "delete"];
    if (
      config.method &&
      methodsRequiringCsrf.includes(config.method.toLowerCase())
    ) {
      await initializeCsrf();
    }

    
    if (!config.headers["X-Platform"]) {
      config.headers["X-Platform"] = "web";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      
      csrfInitialized = false;

      
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
      
      csrfInitialized = false;
    }

    return Promise.reject(error);
  },
);

export default api;
