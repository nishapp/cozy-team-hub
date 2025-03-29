
import React from 'react';
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

interface Bit {
  id: string;
  title: string;
  link?: string;
  visibility: string;
}

interface CreateBookmarkFromBitProps {
  bit: Bit;
}

const CreateBookmarkFromBit: React.FC<CreateBookmarkFromBitProps> = ({ bit }) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // Check if this bit is already bookmarked
  React.useEffect(() => {
    try {
      const bookmarkIdsString = localStorage.getItem('bookmarkedBits') || '[]';
      const bookmarkIds = JSON.parse(bookmarkIdsString);
      setIsBookmarked(bookmarkIds.includes(bit.id));
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  }, [bit.id]);

  const handleToggleBookmark = () => {
    try {
      // Get existing bookmark IDs
      const bookmarkIdsString = localStorage.getItem('bookmarkedBits') || '[]';
      const bookmarkIds = JSON.parse(bookmarkIdsString);
      
      // Get existing bookmarks
      const existingBookmarksString = localStorage.getItem('wdylt_bookmarks') || '[]';
      const existingBookmarks = JSON.parse(existingBookmarksString);
      
      if (isBookmarked) {
        // Remove from bookmarks
        const updatedBookmarkIds = bookmarkIds.filter((id: string) => id !== bit.id);
        localStorage.setItem('bookmarkedBits', JSON.stringify(updatedBookmarkIds));
        
        // Remove from bookmarks list
        const updatedBookmarks = existingBookmarks.filter((bookmark: any) => 
          !(bookmark.title === bit.title && bookmark.url === bit.link)
        );
        localStorage.setItem('wdylt_bookmarks', JSON.stringify(updatedBookmarks));
        
        toast.success("Removed from bookmarks");
        setIsBookmarked(false);
      } else {
        // Add to bookmarks
        localStorage.setItem('bookmarkedBits', JSON.stringify([...bookmarkIds, bit.id]));
        
        // Create bookmark object
        const newBookmark = {
          id: crypto.randomUUID(),
          title: bit.title,
          url: bit.link || "",
          isPublic: bit.visibility === "public",
          folderId: "bits", // Use the special "bits" folder
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

export default CreateBookmarkFromBit;
