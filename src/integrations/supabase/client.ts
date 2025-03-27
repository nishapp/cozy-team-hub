
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

const SUPABASE_URL = "https://znlgxnsizubcplghpokk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpubGd4bnNpenViY3BsZ2hwb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDM2MjksImV4cCI6MjA1ODY3OTYyOX0.w4o6oaBc7KXd4dbkR9ajKBZ4Zgm8qyxSmFTu0ERScp4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Create a storage URL helper
export const getStorageUrl = (bucket: string, path: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};
