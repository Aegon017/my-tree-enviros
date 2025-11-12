export interface VariantColor {
    id: number;
    name: string
    code: string
}

export interface VariantSize {
    id: number;
    name: string
}

export interface VariantPlanter {
    id: number;
    name: string
    image_url?: string | null
}

export interface VariantDetail {
    id: number
    name: string
    color?: VariantColor | null
    size?: VariantSize | null
    planter?: VariantPlanter | null
}

export interface ProductVariantImage {
    url: string
}

export interface ProductVariant {
    id: number
    sku: string
    variant: VariantDetail | null
    image_urls: ProductVariantImage[]
    selling_price: number
    original_price: number | null
    stock_quantity: number
    is_instock: boolean
    in_wishlist: boolean
}