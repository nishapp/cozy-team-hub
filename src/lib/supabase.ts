
import { supabase } from "../integrations/supabase/client";

// Create a flag to detect if we're using demo mode
export const isDemoMode = false;

export type Organization = {
  id: string;
  name: string;
  created_at: string;
};

export type Member = {
  id: string;
  user_id: string;
  organization_id: string;
  role: "admin" | "member";
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export { supabase };
