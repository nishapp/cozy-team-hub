
export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  category?: string;
  image_url?: string;
}
