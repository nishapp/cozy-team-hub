
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.11.0';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY') || '';

if (!anthropicApiKey) {
  console.error('ANTHROPIC_API_KEY is not set');
}

const anthropic = new Anthropic({
  apiKey: anthropicApiKey,
});

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Handle the actual request
  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Scrape the webpage content
    console.log(`Fetching content from URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch webpage: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Simple HTML to text converter for content extraction
    // This is a basic implementation; a more robust solution would use a dedicated HTML parser
    const text = extractTextFromHtml(html);
    const truncatedText = text.slice(0, 10000); // Limit content length
    
    console.log(`Extracted ${truncatedText.length} characters of text`);
    
    // Use Anthropic to summarize the content
    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Please provide a concise 2-3 paragraph summary of the following webpage content. Focus on extracting the key points, main arguments, and important details while maintaining clarity and readability.
          
          Webpage content:
          ${truncatedText}`,
        },
      ],
    });
    
    const summary = message.content[0].text;
    console.log(`Generated summary of ${summary.length} characters`);
    
    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Function to extract text from HTML
function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  
  // Replace all HTML tags with space
  text = text.replace(/<\/?[^>]+(>|$)/g, ' ');
  
  // Replace multiple spaces with a single space
  text = text.replace(/\s+/g, ' ');
  
  // Remove leading/trailing spaces and decode HTML entities
  text = text.trim();
  
  // Decode basic HTML entities
  text = text.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return text;
}
