import React from "react";
import { Helmet } from "react-helmet";

interface OpenGraphHeadProps {
  title?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  type?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
}

const OpenGraphHead = ({
  title = "Cozy Team Hub",
  description = "Share knowledge and collaborate with your team",
  imageUrl = "/og-image.png",
  url,
  type = "website",
  twitterCard = "summary_large_image",
}: OpenGraphHeadProps) => {
  // Use the current URL if none is provided
  const currentUrl = typeof window !== "undefined" ? url || window.location.href : url;
  
  // Make image URL absolute if it's not already
  const absoluteImageUrl = (() => {
    if (!imageUrl) return undefined;
    
    // Check if the URL is already absolute
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Check if it's a relative URL starting with / and convert to absolute
    if (imageUrl.startsWith('/')) {
      return `${window.location.origin}${imageUrl}`;
    }
    
    // Otherwise, assume it's relative to the current path
    return `${window.location.origin}/${imageUrl}`;
  })();

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImageUrl} />
    </Helmet>
  );
};

export default OpenGraphHead;
