
import { createClient } from "@supabase/supabase-js";
import { type Database } from "../types/supabase";

// Get environment variables or use empty strings as fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Create the Supabase client with available credentials
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Mock flag to detect if we're using demo mode (no credentials)
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Check if we should show a warning about missing credentials
if (isDemoMode) {
  console.warn(
    "Running in demo mode: Supabase credentials are missing. Some features will not work. To enable full functionality, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

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
