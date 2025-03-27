
import { createClient } from "@supabase/supabase-js";
import { type Database } from "../types/supabase";

// Get Supabase credentials
const supabaseUrl = "https://znlgxnsizubcplghpokk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubGd4bnNpenViY3BsZ2hwb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDM2MjksImV4cCI6MjA1ODY3OTYyOX0.w4o6oaBc7KXd4dbkR9ajKBZ4Zgm8qyxSmFTu0ERScp4";

// Create a flag to detect if we're using demo mode
export const isDemoMode = false;

// Create the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

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
