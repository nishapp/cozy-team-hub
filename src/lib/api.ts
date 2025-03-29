
// API utility functions
import { supabase } from "@/lib/supabase";

/**
 * Fetch a summary for a webpage URL using Anthropic Claude
 * @param url The URL to summarize
 * @returns The generated summary
 */
export const fetchWebpageSummary = async (url: string): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("Authentication required to use this feature");
    }
    
    // Call the Supabase Edge Function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-webpage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to summarize webpage: ${error}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error fetching webpage summary:', error);
    throw error;
  }
};
