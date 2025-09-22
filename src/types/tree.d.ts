export interface TreePrice {
    id: number
    tree_id: number
    duration: number
    price: string
    created_at: string
    updated_at: string
}

export interface Tree {
    id: number
    state_id: number | null
    city_id: number | null
    type: number
    name: string
    age: string
    slug: string
    sku: string
    area_id: number | null
    main_image: string
    main_image_url: string
    quantity: number
    description: string
    price_info: string
    created_at: string
    updated_at: string
    created_by: number
    updated_by: number
    trash: number
    status: number
    adopted_status: number
    plantation_status: number
    city: string | null
    state: string | null
    price: TreePrice[]
}