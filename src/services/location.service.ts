import api from "@/lib/axios";
import type {
  Location,
  LocationResponse,
  LocationsResponse,
  TreeCountResponse,
} from "@/types/location.types";

/**
 * Location Service for managing location data
 * Handles API calls for locations, hierarchies, and tree counts
 */
export const locationService = {
  /**
   * Get all active locations
   * @param params - Optional query parameters
   * @param params.parent_id - Filter by parent location ID
   * @param params.with_children - Include children locations
   * @param params.with_parent - Include parent location
   */
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

  /**
   * Get root locations (top-level locations without parent)
   */
  getRoot: async () => {
    const response = await api.get<LocationsResponse>("/locations/root");
    return response.data;
  },

  /**
   * Get a specific location by ID
   * @param id - Location ID
   * @param params - Optional query parameters
   * @param params.with_children - Include children locations
   * @param params.with_parent - Include parent location
   */
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

  /**
   * Get children of a specific location
   * @param id - Parent location ID
   */
  getChildren: async (id: number) => {
    const response = await api.get<LocationsResponse>(
      `/locations/${id}/children`,
    );
    return response.data;
  },

  /**
   * Get tree count for a specific location
   * @param id - Location ID
   */
  getTreeCount: async (id: number) => {
    const response = await api.get<TreeCountResponse>(
      `/locations/${id}/tree-count`,
    );
    return response.data;
  },

  /**
   * Get location hierarchy (root locations with their children)
   */
  getHierarchy: async () => {
    const response = await api.get<LocationsResponse>("/locations", {
      params: {
        parent_id: null,
        with_children: true,
      },
    });
    return response.data;
  },

  /**
   * Find location by name (case-insensitive)
   * @param name - Location name to search for
   * @param locations - Array of locations to search in
   */
  findByName: (name: string, locations: Location[]): Location | undefined => {
    return locations.find(
      (loc) => loc.name.toLowerCase() === name.toLowerCase(),
    );
  },

  /**
   * Build location breadcrumb path
   * @param location - Location with loaded parent relationships
   */
  getBreadcrumb: (location: Location): string[] => {
    const breadcrumb: string[] = [location.name];
    let current = location.parent;

    while (current) {
      breadcrumb.unshift(current.name);
      current = current.parent;
    }

    return breadcrumb;
  },

  /**
   * Flatten location hierarchy into a flat array
   * @param locations - Array of locations with children
   */
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
};
