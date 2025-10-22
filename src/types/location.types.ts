export interface Location {
  id: number;
  name: string;
  parent_id: number | null;
  is_active: boolean;
  depth?: number;
  parent?: Location;
  children?: Location[];
  tree_count?: {
    total: number;
    available: number;
  };
  created_at: string;
  updated_at: string;
}

export interface LocationsResponse {
  success: boolean;
  message: string;
  data: {
    locations: Location[];
  };
}

export interface LocationResponse {
  success: boolean;
  message: string;
  data: {
    location: Location;
  };
}

export interface TreeCountResponse {
  success: boolean;
  message: string;
  data: {
    location_id: number;
    total_trees: number;
    available_trees: number;
  };
}
