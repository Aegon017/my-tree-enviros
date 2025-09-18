export interface Blog {
    id: number;
    title: string;
    content: string;
    main_image: string;
    main_image_url: string;
    slug: string;
    created_at: string;
    created_by: number;
    updated_at: string;
    updated_by: number;
    status: number;
    trash: number;
}