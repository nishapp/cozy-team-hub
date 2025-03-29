
import { supabase, getStorageUrl } from "../integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export type CompanyInfo = {
  id: string;
  name: string;
  logo_url: string;
  contact: string;
  email: string;
  website: string;
  created_at: string;
  updated_at: string;
};

// Bookmark folder type definition
export type BookmarkFolder = {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  order: number;
};

// Bookmark item type definition
export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  folder_id: string | null;
  thumbnail_url?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  order: number;
  bit_id?: string;
  source?: 'personal' | 'bit' | 'friend_bit';
};

// Add a variable to control the demo mode functionality
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export { supabase, getStorageUrl };
