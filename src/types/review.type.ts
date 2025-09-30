import type { User } from "./user.type";

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
  user: User;
}
