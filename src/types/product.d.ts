export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  status: number;
}

export interface Color {
  id: number;
  name: string;
  code: string;
}

export interface Size {
  id: number;
  name: string;
}

export interface Planter {
  id: number;
  name: string;
  image_url: string;
}

export interface VariantOption {
  id: number;
  color?: Color;
  size?: Size;
  planter?: Planter;
}

export interface Inventory {
  id: number;
  stock_quantity: number;
  is_instock: boolean;
  has_variants: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  inventory_id: number;
  variant_id: number;
  variant: VariantOption;
  variant_name: string;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  base_price: number;
  discount_price: number | null;
  price: number;
  formatted_price: string;
  stock_quantity: number;
  is_instock: boolean;
  images: Array<{
    id: number;
    url: string;
    thumb: string;
  }>;
  in_wishlist: boolean;
  created_at: string;
  updated_at: string;
}

export interface VariantOptions {
  colors: Color[];
  sizes: Size[];
  planters: Planter[];
}

export interface Product {
  id: number;
  name: string;
  nick_name: string;
  botanical_name: string;
  slug: string;
  sku: string;
  type: number;
  status: number;
  trash: number;
  category_id: number;
  category: Category;
  description: string;
  short_description: string;
  price: number;
  discount_price: number | null;
  quantity: number;
  thumbnail_url: string;
  image_urls: string[];
  reviews: Review[];
  wishlist_tag: boolean;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  rating: number;
  review_count: number;
  is_active: boolean;
  inventory: Inventory | null;
  variants: ProductVariant[];
  formatted_price: string | null;
  has_variants?: boolean;
  variant_options?: VariantOptions | null;
  default_variant?: ProductVariant | null;
}
