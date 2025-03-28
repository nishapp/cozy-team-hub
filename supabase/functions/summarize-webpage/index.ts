
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLAUDE_API_KEY = Deno.env.get("CLAUDE_API_KEY");

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      throw new Error("URL is required");
    }

    if (!CLAUDE_API_KEY) {
      throw new Error("Claude API key is not configured");
    }

    // Fetch the webpage content
    console.log(`Fetching content from: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch webpage: ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`Successfully fetched webpage, content length: ${html.length} characters`);
      
      // Extract text from HTML (basic approach)
      const textContent = extractTextFromHTML(html);
      const truncatedContent = textContent.substring(0, 10000); // Limit content to 10,000 chars
      
      console.log(`Extracted text content (truncated): ${truncatedContent.length} characters`);
      
      // Send to Claude API for summarization
      const summary = await generateSummaryWithClaude(truncatedContent, url);
      
      return new Response(
        JSON.stringify({
          id: crypto.randomUUID(),
          url,
          summary,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error(`Error processing URL ${url}:`, error);
      throw new Error(`Failed to process the webpage: ${error.message}`);
    }
  } catch (error) {
    console.error("Error in summarize-webpage function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Basic HTML text extraction function
function extractTextFromHTML(html: string): string {
  // Remove scripts, styles, and HTML comments
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ") // Remove HTML tags
    .replace(/\s+/g, " "); // Normalize whitespace
  
  return text.trim();
}

async function generateSummaryWithClaude(content: string, url: string): Promise<string> {
  console.log("Sending request to Claude API");
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Please provide a concise summary of this webpage content. Focus on the main points and key information:
          
          URL: ${url}
          
          CONTENT:
          ${content}
          
          Provide a clear and informative summary in 3-5 paragraphs. Don't mention that you're summarizing a webpage, just give the summary directly.`
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Claude API error:", errorData);
    throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
