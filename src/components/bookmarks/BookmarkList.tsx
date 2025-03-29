
import { Bookmark as BookmarkType } from "@/lib/supabase";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
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

interface BookmarkListProps {
  bookmarks: BookmarkType[];
  onDelete: (id: string) => void;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, onDelete }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Title</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookmarks.map((bookmark) => (
            <BookmarkRow 
              key={bookmark.id} 
              bookmark={bookmark}
              onDelete={() => onDelete(bookmark.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface BookmarkRowProps {
  bookmark: BookmarkType;
  onDelete: () => void;
}

const BookmarkRow: React.FC<BookmarkRowProps> = ({ bookmark, onDelete }) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const getSourceLabel = (source?: string) => {
    switch(source) {
      case 'bit': return 'My Bit';
      case 'friend_bit': return 'Friend Bit';
      default: return 'Personal';
    }
  };

  return (
    <TableRow 
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
      {...attributes}
      {...listeners}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-md p-2">
            <Globe className="h-4 w-4 text-primary" />
          </div>
          <div className="truncate max-w-[300px]">{bookmark.title}</div>
        </div>
      </TableCell>
      <TableCell>{formatDate(bookmark.created_at)}</TableCell>
      <TableCell>{getSourceLabel(bookmark.source)}</TableCell>
      <TableCell className="text-right">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleVisit}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">Visit</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
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
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default BookmarkList;
