
import { supabase } from "../integrations/supabase/client";

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
};

export { supabase };
