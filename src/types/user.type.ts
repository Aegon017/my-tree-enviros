export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  profile_photo_path: string | null;
  profile_photo_url: string;
  created_at: string;
  updated_at: string;
}
