import { ApiResponse, BaseMeta } from "./common.types";

export interface TreeResponse extends ApiResponse<{ tree: Tree }> { }

export interface TreeCollectionResponse extends ApiResponse<{
  trees: TreeListItem[];
  meta: BaseMeta;
}> { }

export interface TreeListItem {
  id: number;
  name: string;
  slug: string;
  thumbnail_url: string;
}

export interface Tree {
  id: number;
  sku: string;
  name: string;
  slug: string;
  age: number;
  age_unit: string;
  description: string;
  thumbnail_url: string;
  image_urls: string[];
  plan_prices: PlanPrice[];
}

export interface PlanPrice {
  id: number;
  price: string;
  plan: Plan;
}

export interface Plan {
  duration: number;
  duration_type: string;
}