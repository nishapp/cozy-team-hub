
# Webpage Summarizer Feature

This feature allows users to generate concise summaries of bookmarked webpages using web scraping and AI summarization technology.

## How It Works

1. When viewing a bookmark detail, click the "Generate Page Summary" button
2. The system will:
   - Fetch the content from the bookmarked URL
   - Extract the meaningful text content
   - Send this content to Claude AI to generate a summary
   - Display the summary in the bookmark detail view

## Technical Implementation

### Frontend

- React component that requests summaries and displays results
- Error handling for failed requests
- Loading states during summary generation

### Backend (Mock Implementation)

For demonstration purposes, the application currently uses a mock implementation that:
- Simulates network requests and processing time
- Returns pre-defined summaries for common domains
- Handles errors and edge cases

### In a production environment, you would implement:

1. A Node.js/Express backend with endpoints for:
   - `/api/summarize` - Accepts a URL, scrapes content, and returns summary

2. Web scraping using libraries like:
   - Cheerio or Puppeteer for HTML parsing
   - Axios for HTTP requests

3. Integration with Claude API:
   - Send extracted text to Claude with appropriate prompt
   - Process and return the summary response

4. Security measures:
   - API key management using environment variables
   - Input validation and sanitization
   - Rate limiting to prevent abuse

## Setup for Production

1. Create a `.env` file with your Claude API key:
   ```
   CLAUDE_API_KEY=your_api_key_here
   ```

2. Install required packages:
   ```bash
   npm install axios cheerio @anthropic-ai/sdk
   ```

3. Create an Express server with the summarize endpoint
   ```javascript
   const express = require('express');
   const axios = require('axios');
   const cheerio = require('cheerio');
   const Anthropic = require('@anthropic-ai/sdk');
   
   const app = express();
   app.use(express.json());
   
   app.post('/api/summarize', async (req, res) => {
     try {
       const { url } = req.body;
       
       // 1. Fetch webpage content
       const response = await axios.get(url);
       
       // 2. Extract text with Cheerio
       const $ = cheerio.load(response.data);
       const textContent = $('body').text().replace(/\s+/g, ' ').trim();
       
       // 3. Send to Claude API
       const anthropic = new Anthropic({
         apiKey: process.env.CLAUDE_API_KEY,
       });
       
       const completion = await anthropic.completions.create({
         model: "claude-2",
         prompt: `\n\nHuman: Please provide a concise summary of the following webpage content:\n\n${textContent.substring(0, 10000)}\n\nAssistant:`,
         max_tokens_to_sample: 500,
       });
       
       // 4. Return the summary
       res.json({ summary: completion.completion });
     } catch (error) {
       console.error('Error generating summary:', error);
       res.status(500).json({ 
         message: 'Failed to generate summary',
         error: error.message 
       });
     }
   });
   
   app.listen(3000, () => {
     console.log('API server running on port 3000');
   });
   ```

## Usage Example

```javascript
// Request a summary
const generateSummary = async (url) => {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }
    
    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```
