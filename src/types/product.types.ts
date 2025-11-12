import { ProductCategory } from "./category.types"
import { ProductVariant } from "./variant.types"
import { BaseMeta, ApiResponse } from "./common.types"

export interface Product {
  id: number
  name: string
  nick_name: string
  botanical_name: string
  slug: string
  sku: string
  category: ProductCategory
  description: string
  short_description: string
  reviews: any[]
  rating: number
  review_count: number
  variants: ProductVariant[]
}

export interface ProductListItem {
  id: number
  name: string
  slug: string
  sku: string
  category: ProductCategory
  selling_price: number
  original_price: number | null
  thumbnail_url?: string | null
  short_description: string
  rating: number
  review_count: number
  in_wishlist: boolean
  is_instock: boolean
  has_variants: boolean
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

export type ProductCollectionData = {
  products: ProductListItem[]
  meta: BaseMeta
}

export type ProductSingleData = {
  product: Product
}

export type ProductCollectionResponse = ApiResponse<ProductCollectionData>
export type ProductResponse = ApiResponse<ProductSingleData>