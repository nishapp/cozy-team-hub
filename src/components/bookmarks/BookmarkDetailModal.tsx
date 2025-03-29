
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookmarkItem } from "@/types/bookmark";
import BookmarkSummary from "./BookmarkSummary";
import { ExternalLink, Image as ImageIcon, Sparkles } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookmarkToBitDialog } from "./BookmarkToBitDialog";
import { toast } from "sonner";

interface BookmarkDetailModalProps {
  bookmark: BookmarkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (bookmark: BookmarkItem) => void;
  onCopy?: (bookmark: BookmarkItem) => void;
  onSaveDescription?: (bookmarkId: string, description: string) => void;
  friendName?: string;
  friendAvatar?: string;
}

const BookmarkDetailModal = ({
  bookmark,
  isOpen,
  onClose,
  onEdit,
  onCopy,
  onSaveDescription,
  friendName,
  friendAvatar,
}: BookmarkDetailModalProps) => {
  const [isBitDialogOpen, setIsBitDialogOpen] = useState(false);
  
  if (!bookmark) return null;

  const handleConvertToBit = () => {
    setIsBitDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
          {bookmark.imageUrl && (
            <div className="mb-4 -mt-6 -mx-6 overflow-hidden rounded-t-lg">
              <AspectRatio ratio={16/9}>
                <img
                  src={bookmark.imageUrl}
                  alt={bookmark.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement as HTMLElement;
                    if (parent) {
                      parent.classList.add("bg-gradient-to-br", "from-blue-500/30", "to-purple-500/30");
                    }
                  }}
                />
              </AspectRatio>
            </div>
          )}
          
          <DialogHeader className={cn(bookmark.imageUrl && "-mt-2")}>
            <DialogTitle className="text-xl font-bold">{bookmark.title}</DialogTitle>
            <DialogDescription>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                {bookmark.url} <ExternalLink size={16} />
              </a>
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 mt-2 overflow-y-auto">
            {bookmark.description && (
              <div className="mt-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {bookmark.description}
                </p>
              </div>
            )}

            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Added on {new Date(bookmark.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Summary Component */}
            {bookmark && onSaveDescription && (
              <BookmarkSummary 
                bookmarkItem={bookmark} 
                onSaveDescription={onSaveDescription} 
              />
            )}
          </ScrollArea>

          <DialogFooter className="flex gap-2 justify-end mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleConvertToBit}
              className="flex items-center gap-1"
            >
              <Sparkles size={16} />
              Convert to Bit with AI
            </Button>
            
            {onCopy && (
              <Button variant="outline" onClick={() => onCopy(bookmark)}>
                Copy Bookmark
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" onClick={() => onEdit(bookmark)}>
                Edit
              </Button>
            )}
            {onSaveDescription && bookmark.summary && (
              <Button 
                onClick={() => onSaveDescription(bookmark.id, bookmark.summary || '')}
                variant="default"
              >
                Save as Description
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {bookmark && (
        <BookmarkToBitDialog
          bookmark={bookmark}
          isOpen={isBitDialogOpen}
          onClose={() => setIsBitDialogOpen(false)}
        />
      )}
    </>
  );
};

export default BookmarkDetailModal;
