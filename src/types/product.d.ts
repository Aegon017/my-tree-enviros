export interface Category {
    id: number
    name: string
    slug: string
    icon: string
    status: number
}

export interface Review {
    id: number
    product_id: number
    user_id: number
    rating: number
    review: string
    created_at: string
    updated_at: string
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
    category: Category
    description: string
    price: number
    discount_price: number
    quantity: number
    main_image: string
    main_image_url: string
    reviews: Review[]
    wishlist_tag: boolean
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
}