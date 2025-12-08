import api, { ApiResponse } from "./http-client";

export interface InitiativeSite {
    id: number;
    initiative_id: number;
    location_id: number | null;
    label: string;
    latitude: number | null;
    longitude: number | null;
    capacity: number | null;
}

export interface Initiative {
    id: number;
    name: string;
    slug: string;
    status: string;
    sites: InitiativeSite[];
}

export const initiativeService = {
    getAll: async (): Promise<ApiResponse<{ initiatives: Initiative[] }>> => {
        return api.get("/initiatives");
    },
};
