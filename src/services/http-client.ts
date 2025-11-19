import { authStorage } from "@/lib/auth-storage";

export type ApiResponse<T = any> = {
    success: boolean;
    message?: string;
    data?: T;
};

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export type RequestConfig = RequestInit & {
    params?: Record<string, any>;
};

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const token = authStorage.getToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Platform": "web",
        ...config.headers as any,
    };

    if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    let url = `${BASE_URL}${endpoint}`;
    if (config.params) {
        const params = new URLSearchParams();
        Object.entries(config.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        url += `?${params.toString()}`;
    }

    const { params, ...fetchConfig } = config;

    const response = await fetch(url, {
        ...fetchConfig,
        headers,
    });

    if (response.status === 401) {
        authStorage.clearAll();
        if (typeof window !== "undefined") {
            const p = window.location.pathname;
            if (!p.startsWith("/sign-in") && !p.startsWith("/sign-up") && !p.startsWith("/verify-otp")) {
                window.location.href = "/sign-in";
            }
        }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(data.message || "Request failed", response.status, data);
    }

    return data as ApiResponse<T>;
}

export const api = {
    get: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: "GET" }),
    post: <T>(url: string, body?: any, config?: RequestConfig) => request<T>(url, { ...config, method: "POST", body: JSON.stringify(body) }),
    put: <T>(url: string, body?: any, config?: RequestConfig) => request<T>(url, { ...config, method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(url: string, body?: any, config?: RequestConfig) => request<T>(url, { ...config, method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(url: string, config?: RequestConfig) => request<T>(url, { ...config, method: "DELETE" }),
};

export default api;