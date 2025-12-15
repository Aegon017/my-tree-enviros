import api from "./http-client";

export const appService = {
    getSettings: () => api.get<{ android_url: string; ios_url: string }>("/app-settings"),
};
