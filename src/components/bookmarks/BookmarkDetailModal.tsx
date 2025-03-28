
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookmarkItem } from "@/types/bookmark";
import { BookmarkSummary } from "./BookmarkSummary";
import { ExternalLink } from "lucide-react";

interface BookmarkDetailModalProps {
  bookmark: BookmarkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (bookmark: BookmarkItem) => void;
  onCopy?: (bookmark: BookmarkItem) => void;
}

const BookmarkDetailModal = ({
  bookmark,
  isOpen,
  onClose,
  onEdit,
  onCopy,
}: BookmarkDetailModalProps) => {
  if (!bookmark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
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
        <BookmarkSummary bookmark={bookmark} />

        <div className="flex gap-2 justify-end mt-6">
          {onCopy && (
            <Button variant="outline" onClick={() => onCopy(bookmark)}>
              Copy Bookmark
            </Button>
          )}
          <Button onClick={() => onEdit(bookmark)}>
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkDetailModal;
