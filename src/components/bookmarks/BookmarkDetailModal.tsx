
import React from "react";
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
import { BookmarkSummary } from "./BookmarkSummary";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
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

        <ScrollArea className="flex-1 pr-4">
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
          <BookmarkSummary 
            bookmark={bookmark} 
            onSaveDescription={onSaveDescription} 
          />
        </ScrollArea>

        <DialogFooter className="flex gap-2 justify-end mt-6">
          {onCopy && (
            <Button variant="outline" onClick={() => onCopy(bookmark)}>
              Copy Bookmark
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(bookmark)}>
              Edit
            </Button>
          )}
          {onSaveDescription && (
            <Button 
              onClick={() => onSaveDescription(bookmark.id, bookmark.summary || '')}
              variant="default"
            >
              Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkDetailModal;
