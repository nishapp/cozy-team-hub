
import { v4 as uuidv4 } from 'uuid';

// This is a mock implementation that simulates a server response
// In a real implementation, this would be a server-side function that:
// 1. Scrapes the web content
// 2. Sends it to Claude API
// 3. Returns the summary

// Mock delay function to simulate network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock summaries for different URL patterns
const mockSummaries: Record<string, string> = {
  'github.com': 'GitHub is a web-based platform for version control and collaboration that lets developers work together on projects. It provides hosting for software development and offers features like bug tracking, feature requests, task management, and wikis for every project.',
  'twitter.com': 'Twitter (now X) is a social media platform where users post and interact with short messages called "tweets". The service allows users to post text messages, images, videos, and links to other content across the internet.',
  'medium.com': 'Medium is an online publishing platform developed by Evan Williams and launched in August 2012. The platform is a collection of articles and stories written by both amateur and professional writers on various topics including technology, entrepreneurship, and culture.',
  'developer.mozilla.org': 'Mozilla Developer Network (MDN) is a documentation repository and learning resource for web developers. It provides information about Open Web technologies including HTML, CSS, JavaScript, as well as APIs for both websites and progressive web apps.',
  'reactjs.org': 'React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies. React can be used to develop single-page, mobile, or server-rendered applications.',
};

// Mock function to get a summary based on URL pattern
const getMockSummary = (url: string): string => {
  // Check if the URL matches any of our mock domains
  const matchedDomain = Object.keys(mockSummaries).find(domain => url.includes(domain));
  
  if (matchedDomain) {
    return mockSummaries[matchedDomain];
  }
  
  // Generic summary for unmatched URLs
  return `This webpage appears to be about ${url.split('/')[2]}. The content includes various sections with information related to the site's main topic. Key points are presented throughout the page, with supporting details and possibly media content. The page is structured to provide a comprehensive overview of its subject matter.`;
};

// Generate a simple ID if uuid is not available
const generateId = () => {
  try {
    return uuidv4();
  } catch (error) {
    // Fallback to a simple timestamp-based ID if uuid is not available
    return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
};

// Mock API endpoint handler
export const handleSummarizeRequest = async (url: string) => {
  // Validate URL
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Invalid URL provided');
  }

  // Simulate processing time (3-5 seconds)
  const processingTime = 3000 + Math.random() * 2000;
  await delay(processingTime);
  
  // 10% chance of a random error to simulate real-world issues
  if (Math.random() < 0.1) {
    throw new Error('Failed to process the webpage. Please try again.');
  }
  
  // Return a mock summary
  return {
    id: generateId(),
    url,
    summary: getMockSummary(url),
    timestamp: new Date().toISOString(),
  };
};
