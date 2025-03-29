
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  created_at: string;
  tags?: string[];
}

interface CreateBookmarkFromPostProps {
  post: Post;
}

const CreateBookmarkFromPost: React.FC<CreateBookmarkFromPostProps> = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const navigate = useNavigate();

  // Check if this post is already bookmarked
  React.useEffect(() => {
    try {
      const bookmarksString = localStorage.getItem('wdylt_bookmarks') || '[]';
      const bookmarks = JSON.parse(bookmarksString);
      
      // Check if this post URL is already bookmarked
      const postUrl = `${window.location.origin}/post/${post.id}`;
      setIsBookmarked(bookmarks.some((bookmark: any) => bookmark.url === postUrl));
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }, [post.id]);

  const handleToggleBookmark = () => {
    try {
      // Get existing bookmarks
      const existingBookmarksString = localStorage.getItem('wdylt_bookmarks') || '[]';
      const existingBookmarks = JSON.parse(existingBookmarksString);
      
      // Create the post URL
      const postUrl = `${window.location.origin}/post/${post.id}`;
      
      if (isBookmarked) {
        // Remove from bookmarks list
        const updatedBookmarks = existingBookmarks.filter((bookmark: any) => bookmark.url !== postUrl);
        localStorage.setItem('wdylt_bookmarks', JSON.stringify(updatedBookmarks));
        
        toast.success("Removed from bookmarks");
        setIsBookmarked(false);
      } else {
        // Create bookmark object
        const newBookmark = {
          id: crypto.randomUUID(),
          title: post.title,
          url: postUrl,
          isPublic: false, // Default to private
          folderId: "root", // Default to root folder
          createdAt: new Date().toISOString(),
        };
        
        // Add to bookmarks list
        localStorage.setItem('wdylt_bookmarks', JSON.stringify([newBookmark, ...existingBookmarks]));
        
        toast.success("Added to bookmarks");
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error updating bookmarks:", error);
      toast.error("Error updating bookmarks");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`flex items-center gap-1 ${isBookmarked ? "text-primary" : ""}`}
      onClick={handleToggleBookmark}
    >
      {isBookmarked ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Bookmarked</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Bookmark</span>
        </>
      )}
    </Button>
  );
};

export default CreateBookmarkFromPost;
