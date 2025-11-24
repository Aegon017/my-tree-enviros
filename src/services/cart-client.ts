import api from "@/services/http-client";

export const cartClientApi = {
    get: () => api.get("/cart"),
    add: (data: any) => api.post("/cart/items", data),
    update: (id: number, payload: any) => api.put(`/cart/items/${id}`, payload),
    remove: (id: number) => api.delete(`/cart/items/${id}`),
    clear: () => api.delete("/cart"),
};