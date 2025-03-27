
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

// Add a variable to control the demo mode functionality
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export { supabase, getStorageUrl };
