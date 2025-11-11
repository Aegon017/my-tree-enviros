export interface Color {
  id: number
  name: string
  code: string
}

export interface Size {
  id: number
  name: string
}

export interface Planter {
  id: number
  name: string
  image_url?: string
}

export interface ProductVariant {
  id: number
  sku: string
  inventory_id: number
  variant_id: number
  variant: {
    id: number
    color?: Color
    size?: Size
    planter?: Planter
  }
  variant_name: string
  base_price: number
  discount_price: number | null
  selling_price: number
  original_price: number | null
  stock_quantity: number
  is_instock: boolean
  images: Array<{
    id: number
    url: string
  }>
  created_at: string
  updated_at: string
}


export interface ProductCategory {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  nick_name: string
  botanical_name: string
  slug: string
  sku: string
  type: number
  status: number
  trash: number
  category_id: number
  category: {
    id: number
    name: string
    slug: string
    icon: string
    status: number
  }
  description: string
  short_description: string

  selling_price: number
  original_price: number | null

  quantity: number
  thumbnail_url: string
  image_urls: string[]
  reviews: any[]
  in_wishlist: boolean
  created_at: string
  updated_at: string
  created_by: number
  updated_by: number
  rating: number
  review_count: number
  is_active: boolean
  inventory: {
    id: number
    stock_quantity: number
    is_instock: boolean
    has_variants: boolean
  } | null
  variants?: ProductVariant[]
  has_variants?: boolean
  default_variant?: ProductVariant | null
  default_variant_id?: number | null
  variant_options?: {
    colors: Color[]
    sizes: Size[]
    planters: Planter[]
  } | null
}

export interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface ProductsResponse {
  success: boolean
  message: string
  data: {
    data: Product[]
    meta: Meta
  }
}

export interface ProductResponse {
  success: boolean
  message: string
  data: {
    product: Product
  }
}

export interface ProductParams {
  search?: string
  category_id?: number
  min_price?: number
  max_price?: number
  in_stock?: boolean
  sort_by?: "name" | "selling_price" | "created_at"
  sort_order?: "asc" | "desc"
  per_page?: number
  page?: number
}

export type ProductsApiSuccess = {
  success: true
  message: string
  data: {
    products: Product[]
    meta: Meta
  }
}

export type ProductsApiError = {
  success: false
  message: string
}

export type ProductsApiResponse = ProductsApiSuccess | ProductsApiError

export interface ProductCategoriesResponse {
  success: boolean,
  message: string,
  data: {
    categories: ProductCategory[]
  }
}