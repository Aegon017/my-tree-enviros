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
 * Normalize a tree item returned by the backend into the frontend Tree type.
 */
function normalizeTree(apiTree: any): Tree {
  if (!apiTree || typeof apiTree !== "object") {
    // Sensible defaults to avoid crashes in UI
    return {
      id: 0,
      state_id: null,
      city_id: null,
      type: 1,
      name: "",
      age: "0",
      slug: "",
      sku: "",
      area_id: null,
      main_image: "",
      quantity: 0,
      description: "",
      price_info: "",
      created_at: "",
      updated_at: "",
      created_by: 0,
      updated_by: 0,
      trash: 0,
      status: 0,
      adopted_status: 0,
      plantation_status: 0,
      main_image_url: "",
      images: [],
      city: null,
      state: null,
      price: [],
      reviews: [],
    };
  }

  // Build images array (TreeImage[])
  const images =
    Array.isArray(apiTree.images) && apiTree.images.length > 0
      ? apiTree.images.map((img: any) => ({
          id: Number(img.id ?? 0),
          tree_id: Number(apiTree.id ?? 0),
          image: String(img.image_url ?? ""),
          created_at: img.created_at ? String(img.created_at) : "",
          updated_at: img.updated_at ? String(img.updated_at) : "",
          image_url: String(img.image_url ?? ""),
        }))
      : [];

  // Build price array (TreePrice[]) from plan_prices
  const price =
    Array.isArray(apiTree.plan_prices) && apiTree.plan_prices.length > 0
      ? (apiTree.plan_prices
          .map((pp: any) => {
            const duration = Number(pp?.plan?.duration ?? 0);
            if (!duration) return null;
            return {
              id: Number(pp.id ?? 0),
              tree_id: Number(pp.tree_id ?? apiTree.id ?? 0),
              duration,
              price:
                typeof pp.numeric_price === "number"
                  ? pp.numeric_price.toFixed(2)
                  : String(pp.price ?? "0").replace(/,/g, ""),
              created_at: pp.created_at ? String(pp.created_at) : "",
              updated_at: pp.updated_at ? String(pp.updated_at) : "",
            };
          })
          .filter(Boolean) as Tree["price"])
      : [];

  // Main image: prefer explicit main_image_url, then thumbnail
  const mainImageUrl =
    (apiTree.main_image_url as string | undefined) ??
    (apiTree.thumbnail as string | undefined) ??
    "";

  // Quantity: map from available_instances_count if present
  const quantity =
    typeof apiTree.available_instances_count === "number"
      ? apiTree.available_instances_count
      : 0;

  return {
    id: Number(apiTree.id ?? 0),
    state_id: null,
    city_id: null,
    type: 1,
    name: String(apiTree.name ?? ""),
    age:
      typeof apiTree.age === "string"
        ? apiTree.age
        : apiTree.age != null
          ? String(apiTree.age)
          : "0",
    slug: String(apiTree.slug ?? ""),
    sku: String(apiTree.sku ?? ""),
    area_id: null,
    main_image: "",
    quantity,
    description: String(apiTree.description ?? ""),
    price_info: String(apiTree.price_info ?? ""),
    created_at: apiTree.created_at ? String(apiTree.created_at) : "",
    updated_at: apiTree.updated_at ? String(apiTree.updated_at) : "",
    created_by: 0,
    updated_by: 0,
    trash: 0,
    status: apiTree.is_active === false ? 0 : 1,
    adopted_status: 0,
    plantation_status: 0,
    main_image_url: mainImageUrl,
    images,
    city: null,
    state: null,
    price,
    reviews: Array.isArray(apiTree.reviews) ? apiTree.reviews : [],
  };
}

/**
 * Normalize list response from backend to TreesResponse.
 */
function normalizeTreesResponse(apiData: any): TreesResponse {
  const payload = apiData?.data ?? {};
  const meta = payload?.meta ?? {};
  const treesRaw = payload?.trees ?? [];

  const trees: Tree[] = Array.isArray(treesRaw)
    ? treesRaw.map(normalizeTree)
    : [];

  return {
    success: Boolean(apiData?.success ?? true),
    message: String(apiData?.message ?? "Success"),
    data: {
      trees,
      meta: {
        current_page: Number(meta.current_page ?? 1),
        last_page: Number(meta.last_page ?? 1),
        per_page: Number(meta.per_page ?? (trees.length || 0)),
        total: Number(meta.total ?? (trees.length || 0)),
        from: Number(meta.from ?? (trees.length > 0 ? 1 : 0)),
        to: Number(meta.to ?? trees.length),
      },
    },
  };
}

/**
 * Normalize detail response from backend to TreeResponse.
 */
function normalizeTreeResponse(apiData: any): TreeResponse {
  const payload = apiData?.data ?? {};
  const tree = normalizeTree(payload?.tree);

  return {
    success: Boolean(apiData?.success ?? true),
    message: String(apiData?.message ?? "Success"),
    data: { tree },
  };
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
    const { data } = await api.get("/trees", { params });
    return normalizeTreesResponse(data);
  },

  /**
   * Get trees available for sponsorship
   * @param params - Query parameters including location_id for filtering
   */
  getSponsorship: async (params?: TreeParams) => {
    const { data } = await api.get("/trees/sponsorship", { params });
    return normalizeTreesResponse(data);
  },

  /**
   * Get trees available for adoption
   * @param params - Query parameters including location_id for filtering
   */
  getAdoption: async (params?: TreeParams) => {
    const { data } = await api.get("/trees/adoption", { params });
    return normalizeTreesResponse(data);
  },

  /**
   * Get a specific tree by ID
   * @param id - Tree ID
   */
  getById: async (id: number) => {
    const { data } = await api.get(`/trees/${id}`);
    return normalizeTreeResponse(data);
  },

  /**
   * Get available plans for a specific tree
   * @param id - Tree ID
   */
  getPlans: async (id: number) => {
    const response = await api.get(`/trees/${id}/plans`);
    return response.data;
  },

  /**
   * Filter trees by location
   * @param trees - Array of trees
   * @param locationId - Location ID to filter by
   */
  filterByLocation: (trees: Tree[], _locationId: number): Tree[] => {
    // Prefer using location_id parameter in API calls
    return trees.filter((tree) => (tree.quantity ?? 0) > 0);
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
    return (tree.status ?? 0) === 1 && (tree.quantity ?? 0) > 0;
  },

  /**
   * Get availability status text
   * @param tree - Tree object
   */
  getAvailabilityStatus: (tree: Tree): string => {
    if ((tree.status ?? 0) !== 1) {
      return "Not Available";
    }

    if ((tree.quantity ?? 0) === 0) {
      return "Out of Stock";
    }

    if ((tree.quantity ?? 0) < 10) {
      return `Only ${tree.quantity} left`;
    }

    return "Available";
  },
};
