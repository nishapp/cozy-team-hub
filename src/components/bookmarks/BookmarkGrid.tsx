
import { Bookmark as BookmarkType } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal, Trash, Edit, Globe } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface BookmarkGridProps {
  bookmarks: BookmarkType[];
  onDelete: (id: string) => void;
}

const BookmarkGrid: React.FC<BookmarkGridProps> = ({ bookmarks, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {bookmarks.map((bookmark) => (
        <BookmarkCard 
          key={bookmark.id} 
          bookmark={bookmark}
          onDelete={() => onDelete(bookmark.id)}
        />
      ))}
    </div>
  );
};

interface BookmarkCardProps {
  bookmark: BookmarkType;
  onDelete: () => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onDelete }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({ id: `bookmark-${bookmark.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleVisit = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(bookmark.url, '_blank');
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="group hover:shadow-md transition-all overflow-hidden"
      {...attributes}
      {...listeners}
    >
      {bookmark.thumbnail_url ? (
        <div className="aspect-video bg-muted overflow-hidden">
          <img 
            src={bookmark.thumbnail_url} 
            alt={bookmark.title} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video bg-primary/10 flex items-center justify-center">
          <Globe className="h-12 w-12 text-primary/50" />
        </div>
      )}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{bookmark.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleVisit}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {bookmark.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bookmark.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleVisit}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookmarkGrid;
