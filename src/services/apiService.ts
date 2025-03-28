
import { handleSummarizeRequest } from "@/mock/api/summarize";

// Setup a fetch interceptor for our mock API
const originalFetch = window.fetch;

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? input : input.url;
  
  // Handle our mock API endpoints
  if (url === '/api/summarize' && init?.method === 'POST') {
    try {
      const body = JSON.parse(init.body as string);
      const result = await handleSummarizeRequest(body.url);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error in mock API:", error);
      
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
