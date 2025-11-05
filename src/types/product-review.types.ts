export interface ProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified_purchase: boolean;
  status: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProductReviewResponse {
  success: boolean;
  message: string;
  data: {
    review: ProductReview;
  };
}

export interface ProductReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: ProductReview[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CanReviewResponse {
  can_review: boolean;
  reason?: string;
  has_purchased: boolean;
}

export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}