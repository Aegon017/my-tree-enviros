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


function normalizeTree(apiTree: any): Tree {
  if (!apiTree || typeof apiTree !== "object") {
    
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
      thumbnail: "",
      images: [],
      city: null,
      state: null,
      price: [],
      reviews: [],
    };
  }

  
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

  
  const mainImageUrl =
    (apiTree.main_image_url as string | undefined) ??
    (apiTree.thumbnail as string | undefined) ??
    "";

  
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
    thumbnail: String(apiTree.thumbnail ?? mainImageUrl),
    images,
    city: null,
    state: null,
    price,
    reviews: Array.isArray(apiTree.reviews) ? apiTree.reviews : [],
  };
}


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


function normalizeTreeResponse(apiData: any): TreeResponse {
  const payload = apiData?.data ?? {};
  const tree = normalizeTree(payload?.tree);

  return {
    success: Boolean(apiData?.success ?? true),
    message: String(apiData?.message ?? "Success"),
    data: { tree },
  };
}


export const treeService = {
  
  getAll: async (params?: TreeParams) => {
    const { data } = await api.get("/trees", { params });
    return normalizeTreesResponse(data);
  },

  
  getSponsorship: async (params?: TreeParams) => {
    const { data } = await api.get("/trees/sponsorship", { params });
    return normalizeTreesResponse(data);
  },

  
  getAdoption: async (params?: TreeParams) => {
    const { data } = await api.get("/trees/adoption", { params });
    return normalizeTreesResponse(data);
  },

  
  getById: async (id: number) => {
    const { data } = await api.get(`/trees/${id}`);
    return normalizeTreeResponse(data);
  },

  
  getPlans: async (id: number) => {
    const response = await api.get(`/trees/${id}/plans`);
    return response.data;
  },

  
  filterByLocation: (trees: Tree[], _locationId: number): Tree[] => {
    
    return trees.filter((tree) => (tree.quantity ?? 0) > 0);
  },

  
  searchByName: (trees: Tree[], query: string): Tree[] => {
    const lowerQuery = query.toLowerCase();
    return trees.filter((tree) => tree.name.toLowerCase().includes(lowerQuery));
  },

  
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

  
  formatAge: (tree: Tree): string => {
    return tree.age;
  },

  
  isAvailable: (tree: Tree): boolean => {
    return (tree.status ?? 0) === 1 && (tree.quantity ?? 0) > 0;
  },

  
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
