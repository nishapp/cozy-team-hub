
import React, { useState } from "react";
import { Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

interface SocialShareProps {
  title?: string;
  description?: string;
  hashtags?: string[];
  className?: string;
}

const SocialShare = ({
  title = document.title,
  description = "Check out this page",
  hashtags = [],
  className = "",
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  // Format hashtags for Twitter
  const hashtagsString = hashtags.map(tag => tag.startsWith('#') ? tag.substring(1) : tag).join(',');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&hashtags=${hashtagsString}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy: ", err);
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "width=600,height=400,resizable=yes,scrollbars=yes");
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Share on Facebook"
              className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 dark:bg-blue-950 dark:text-blue-400 dark:hover:bg-blue-900"
              onClick={() => openShareWindow(shareLinks.facebook)}
            >
              <Facebook size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on Facebook</p>
          </TooltipContent>
        </Tooltip>
      
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Share on X (Twitter)"
              className="h-9 w-9 rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              onClick={() => openShareWindow(shareLinks.twitter)}
            >
              <Twitter size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on X (Twitter)</p>
          </TooltipContent>
        </Tooltip>
      
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Share on LinkedIn"
              className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
              onClick={() => openShareWindow(shareLinks.linkedin)}
            >
              <Linkedin size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share on LinkedIn</p>
          </TooltipContent>
        </Tooltip>
      
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Copy link"
              className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={handleCopyLink}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copied!" : "Copy link"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default SocialShare;
