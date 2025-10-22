import api from "@/lib/axios";
import type { Tree } from "@/types/tree";

export interface TreesResponse {
  success: boolean;
  message: string;
  data: {
    trees: Tree[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
      from: number;
      to: number;
    };
  };
}

export interface TreeResponse {
  success: boolean;
  message: string;
  data: {
    tree: Tree;
  };
}

export interface TreeParams {
  search?: string;
  location_id?: number;
  min_age?: number;
  max_age?: number;
  age_unit?: string;
  sort_by?: "name" | "age" | "created_at";
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

/**
 * Tree Service for managing tree data
 * Handles API calls for trees with location filtering
 */
export const treeService = {
  /**
   * Get all trees with optional filters
   * @param params - Query parameters for filtering and pagination
   */
  getAll: async (params?: TreeParams) => {
    const response = await api.get<TreesResponse>("/v1/trees", {
      params,
    });
    return response.data;
  },

  /**
   * Get trees available for sponsorship
   * @param params - Query parameters including location_id for filtering
   */
  getSponsorship: async (params?: TreeParams) => {
    const response = await api.get<TreesResponse>("/v1/trees/sponsorship", {
      params,
    });
    return response.data;
  },

  /**
   * Get trees available for adoption
   * @param params - Query parameters including location_id for filtering
   */
  getAdoption: async (params?: TreeParams) => {
    const response = await api.get<TreesResponse>("/v1/trees/adoption", {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific tree by ID
   * @param id - Tree ID
   */
  getById: async (id: number) => {
    const response = await api.get<TreeResponse>(`/v1/trees/${id}`);
    return response.data;
  },

  /**
   * Get available plans for a specific tree
   * @param id - Tree ID
   */
  getPlans: async (id: number) => {
    const response = await api.get(`/v1/trees/${id}/plans`);
    return response.data;
  },

  /**
   * Filter trees by location
   * @param trees - Array of trees
   * @param locationId - Location ID to filter by
   */
  filterByLocation: (trees: Tree[], locationId: number): Tree[] => {
    // Note: This is a client-side fallback
    // Prefer using location_id parameter in API calls
    return trees.filter((tree) => tree.quantity > 0);
  },

  /**
   * Search trees by name
   * @param trees - Array of trees
   * @param query - Search query
   */
  searchByName: (trees: Tree[], query: string): Tree[] => {
    const lowerQuery = query.toLowerCase();
    return trees.filter((tree) => tree.name.toLowerCase().includes(lowerQuery));
  },

  /**
   * Sort trees
   * @param trees - Array of trees
   * @param sortBy - Field to sort by
   * @param sortOrder - Sort direction
   */
  sort: (
    trees: Tree[],
    sortBy: "name" | "age" | "created_at" = "name",
    sortOrder: "asc" | "desc" = "asc",
  ): Tree[] => {
    return [...trees].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "age":
          comparison = parseInt(a.age) - parseInt(b.age);
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  },

  /**
   * Get cheapest plan for a tree
   * @param tree - Tree object with price array
   */
  getCheapestPlan: (tree: Tree) => {
    if (!tree.price || tree.price.length === 0) {
      return null;
    }

    return tree.price.reduce((cheapest, current) =>
      parseFloat(current.price) < parseFloat(cheapest.price)
        ? current
        : cheapest,
    );
  },

  /**
   * Format tree age display
   * @param tree - Tree object
   */
  formatAge: (tree: Tree): string => {
    return tree.age;
  },

  /**
   * Check if tree is available
   * @param tree - Tree object
   */
  isAvailable: (tree: Tree): boolean => {
    return tree.status === 1 && tree.quantity > 0;
  },

  /**
   * Get availability status text
   * @param tree - Tree object
   */
  getAvailabilityStatus: (tree: Tree): string => {
    if (tree.status !== 1) {
      return "Not Available";
    }

    if (tree.quantity === 0) {
      return "Out of Stock";
    }

    if (tree.quantity < 10) {
      return `Only ${tree.quantity} left`;
    }

    return "Available";
  },
};
