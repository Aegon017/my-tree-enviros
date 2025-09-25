export interface Tree {
    id: number;
    state_id: number | null;
    city_id: number | null;
    type: number;
    name: string;
    age: string;
    slug: string;
    sku: string;
    area_id: number | null;
    main_image: string;
    quantity: number;
    description: string;
    price_info: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
    trash: number;
    status: number;
    adopted_status: number;
    plantation_status: number;
    main_image_url: string;
    images: TreeImage[];
    city: City | null;
    state: State | null;
    price: TreePrice[];
}

export interface City {
    id: number;
    name: string;
    slug: string;
    state_id: number;
    status: number;
    trash: number;
    main_img: string | null;
    main_img_url: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
}

export interface State {
    id: number;
    name: string;
    slug: string;
    status: number;
    trash: number;
    main_img: string | null;
    main_img_url: string;
    created_at: string;
    updated_at: string;
    created_by: number;
    updated_by: number;
}

export interface TreeImage {
    id: number;
    tree_id: number;
    image: string;
    created_at: string;
    updated_at: string;
    image_url: string;
}

export interface TreePrice {
    id: number;
    tree_id: number;
    duration: number;
    price: string;
    created_at: string;
    updated_at: string;
}
