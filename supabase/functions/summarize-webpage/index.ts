
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the webpage content
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch the webpage: ${response.statusText}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, 'text/html');

    if (!document) {
      throw new Error('Failed to parse HTML');
    }

    // Extract main text content
    const content = extractMainContent(document);
    
    // Extract hero image
    const heroImage = extractHeroImage(document, url);

    // Use OpenAI to summarize content if API key exists
    let summary = '';
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (openaiApiKey && content) {
      try {
        summary = await generateSummaryWithOpenAI(content, openaiApiKey);
      } catch (error) {
        console.error('Error generating summary with OpenAI:', error);
        // Fall back to a basic summary
        summary = generateBasicSummary(content);
      }
    } else {
      // Generate a basic summary if no OpenAI API key
      summary = generateBasicSummary(content);
    }

    return new Response(
      JSON.stringify({
        summary,
        heroImage,
        url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to extract main content
function extractMainContent(document: Document): string {
  // Try to find the main content area
  const selectors = [
    'article', 'main', '.content', '#content', '.post-content', 
    '.article-content', '.entry-content', '[role="main"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  
  // If no main content area is found, use the body
  const body = document.querySelector('body');
  if (body) {
    // Remove script, style, nav, footer elements
    const scripts = body.querySelectorAll('script, style, nav, footer, header, aside');
    scripts.forEach(script => script.remove());
    
    return body.textContent?.trim() || '';
  }
  
  return '';
}

// Function to extract hero image
function extractHeroImage(document: Document, baseUrl: string): string | null {
  // Try to find meta tags for og:image or twitter:image
  const metaSelectors = [
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'meta[property="twitter:image"]',
    'meta[name="og:image"]'
  ];
  
  for (const selector of metaSelectors) {
    const metaTag = document.querySelector(selector);
    if (metaTag) {
      const content = metaTag.getAttribute('content');
      if (content) {
        return resolveUrl(content, baseUrl);
      }
    }
  }
  
  // Try to find the largest image in the document
  const images = Array.from(document.querySelectorAll('img'));
  if (images.length === 0) return null;
  
  // Filter out small images and icons
  const filteredImages = images
    .filter(img => {
      const src = img.getAttribute('src');
      if (!src) return false;
      
      // Skip likely icons and very small images
      const width = parseInt(img.getAttribute('width') || '0');
      const height = parseInt(img.getAttribute('height') || '0');
      
      // Skip if explicitly tiny
      if (width > 0 && width < 100) return false;
      if (height > 0 && height < 100) return false;
      
      // Skip icons and emoticons by filename pattern
      const srcLower = src.toLowerCase();
      if (srcLower.includes('icon') || 
          srcLower.includes('logo') || 
          srcLower.includes('emoticon') ||
          srcLower.includes('avatar') ||
          srcLower.includes('favicon')) {
        return false;
      }
      
      return true;
    });
  
  if (filteredImages.length === 0) return null;
  
  // Find the first image with significant area, or just the first one
  const heroImage = filteredImages[0];
  const src = heroImage.getAttribute('src');
  
  if (src) {
    return resolveUrl(src, baseUrl);
  }
  
  return null;
}

// Resolve relative URLs to absolute
function resolveUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString();
  } catch (e) {
    console.error('Error resolving URL:', e);
    return url; // Return the original URL if resolution fails
  }
}

// Function to generate a basic summary of the content
function generateBasicSummary(content: string): string {
  // Limit to first 500 characters for a basic summary
  const truncated = content.substring(0, 2000).trim();
  
  // Split into sentences
  const sentences = truncated.split(/(?<=[.!?])\s+/);
  
  // Take the first few sentences (up to 5)
  return sentences.slice(0, 5).join(' ');
}

// Function to generate a summary using OpenAI
async function generateSummaryWithOpenAI(content: string, apiKey: string): Promise<string> {
  const trimmedContent = content.substring(0, 4000); // Limit to avoid token limits
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes webpage content concisely. Provide a 2-3 paragraph summary.'
        },
        {
          role: 'user',
          content: `Summarize this webpage content in 2-3 paragraphs: ${trimmedContent}`
        }
      ],
      max_tokens: 300
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
