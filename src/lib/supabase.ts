
import { supabase } from "../integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

// Add a variable to control the demo mode functionality
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export { supabase };
