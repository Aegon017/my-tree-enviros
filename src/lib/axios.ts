import axios from "axios";
import { authStorage } from "./auth-storage";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
