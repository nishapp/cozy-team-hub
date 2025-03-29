
import { Button } from "@/components/ui/button";
import { BookmarkPlus, FolderPlus } from "lucide-react";

interface EmptyStateProps {
  onAddBookmark: () => void;
  onAddFolder: () => void;
}

const EmptyState = ({ onAddBookmark, onAddFolder }: EmptyStateProps) => {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
      <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <BookmarkPlus className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">No bookmarks yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start organizing your favorite websites and online resources by creating folders and adding bookmarks.
      </p>
      <div className="flex items-center justify-center gap-4">
        <Button onClick={onAddFolder} variant="outline">
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Folder
        </Button>
        <Button onClick={onAddBookmark}>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
