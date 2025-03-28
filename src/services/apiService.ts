
import { handleSummarizeRequest } from "@/mock/api/summarize";
import { supabase } from "@/integrations/supabase/client";

// Setup a fetch interceptor for our mock API
const originalFetch = window.fetch;

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' 
    ? input 
    : input instanceof Request 
      ? input.url 
      : input.toString();
  
  // Handle our mock API endpoints
  if (url === '/api/summarize' && init?.method === 'POST') {
    try {
      const body = JSON.parse(init.body as string);
      
      // Use Supabase Edge Function instead of mock
      try {
        const { data, error } = await supabase.functions.invoke('summarize-webpage', {
          body: { url: body.url }
        });
        
        if (error) {
          throw new Error(error.message || 'Error calling the summarize function');
        }
        
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (supabaseError) {
        console.error("Error calling Supabase function:", supabaseError);
        
        // Fallback to mock implementation if Supabase function fails
        console.warn("Falling back to mock implementation...");
        const result = await handleSummarizeRequest(body.url);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error("Error in API service:", error);
      
      return new Response(JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }
  
  // For all other requests, use the original fetch
  return originalFetch.apply(window, [input, init]);
};

export default {
  // This is a placeholder to make this a valid module
  initialize: () => {
    console.log('API service initialized');
  }
};
