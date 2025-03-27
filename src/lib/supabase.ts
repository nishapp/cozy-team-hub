
import { supabase } from "../integrations/supabase/client";

// Create a flag to detect if we're using demo mode
export const isDemoMode = false;

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export { supabase };
