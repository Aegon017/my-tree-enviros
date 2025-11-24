import api from "@/services/http-client";
import type {
  Location,
  LocationResponse,
  LocationsResponse,
  TreeCountResponse,
} from "@/types/location.types";


export const locationService = {

  getAll: async (params?: {
    parent_id?: number | null;
    with_children?: boolean;
    with_parent?: boolean;
    type?: "city" | "state" | "country" | "area";
  }) => {
    const response = await api.get<LocationsResponse>("/locations", {
      params,
    });
    return response.data;
  },


  getRoot: async () => {
    const response = await api.get<LocationsResponse>("/locations/root");
    return response.data;
  },


  getById: async (
    id: number,
    params?: {
      with_children?: boolean;
      with_parent?: boolean;
    },
  ) => {
    const response = await api.get<LocationResponse>(`/locations/${id}`, {
      params,
    });
    return response.data;
  },


  getChildren: async (id: number) => {
    const response = await api.get<LocationsResponse>(
      `/locations/${id}/children`,
    );
    return response.data;
  },


  getTreeCount: async (id: number) => {
    const response = await api.get<TreeCountResponse>(
      `/locations/${id}/tree-count`,
    );
    return response.data;
  },


  getHierarchy: async () => {
    const response = await api.get<LocationsResponse>("/locations", {
      params: {
        parent_id: null,
        with_children: true,
      },
    });
    return response.data;
  },


  findByName: (name: string, locations: Location[]): Location | undefined => {
    return locations.find(
      (loc) => loc.name.toLowerCase() === name.toLowerCase(),
    );
  },


  getBreadcrumb: (location: Location): string[] => {
    const breadcrumb: string[] = [location.name];
    let current = location.parent;

    while (current) {
      breadcrumb.unshift(current.name);
      current = current.parent;
    }

    return breadcrumb;
  },


  flatten: (locations: Location[]): Location[] => {
    const result: Location[] = [];

    const traverse = (locs: Location[]) => {
      for (const loc of locs) {
        result.push(loc);
        if (loc.children && loc.children.length > 0) {
          traverse(loc.children);
        }
      }
    };

    traverse(locations);
    return result;
  },


  getTreeLocationStates: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: any[];
    }>("/tree-locations/states");
    return response.data;
  },


  getTreeLocationAreas: async (stateId: number) => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: any[];
    }>(`/tree-locations/states/${stateId}/areas`);
    return response.data;
  },


  getTreeLocationCities: async (areaId: number) => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: any[];
    }>(`/tree-locations/areas/${areaId}/cities`);
    return response.data;
  },


  getTreeLocationHierarchy: async () => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: {
        states: any[];
        areas: any[];
        cities: any[];
      };
    }>("/tree-locations/hierarchy");
    return response.data;
  },
};
