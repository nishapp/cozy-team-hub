
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, Image, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { BookmarkItem } from "@/types/bookmark";
import { Card, CardContent } from "@/components/ui/card";

// Sample related bits data for demonstration
const sampleRelatedBits = [
  {
    id: "bit-1",
    title: "JavaScript Promises Explained",
    description: "A deep dive into JavaScript promises and async/await.",
    tags: ["javascript", "async", "promises"],
    image_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=350&fit=crop",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bit-2",
    title: "React Hooks Best Practices",
    description: "Tips and tricks for using React hooks effectively.",
    tags: ["react", "hooks", "javascript"],
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

interface BookmarkDetailModalProps {
  bookmark: BookmarkItem;
  friendName: string;
  friendAvatar?: string;
  isOpen: boolean;
  onClose: () => void;
  onCopyBookmark: (bookmark: BookmarkItem) => void;
  onCreateBitFromBookmark: (bookmark: BookmarkItem) => void;
}

const BookmarkDetailModal: React.FC<BookmarkDetailModalProps> = ({
  bookmark,
  friendName,
  friendAvatar,
  isOpen,
  onClose,
  onCopyBookmark,
  onCreateBitFromBookmark
}) => {
  const [relatedBits, setRelatedBits] = useState<any[]>([]);

  // For demo purposes, we're using sample data
  // In a real app, fetch related bits here
  useEffect(() => {
    if (isOpen) {
      // This would be replaced with an actual API call
      setRelatedBits(sampleRelatedBits);
    }
  }, [isOpen, bookmark.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="grid md:grid-cols-7 h-full">
          {/* Left side - Bookmark Details */}
          <div className="md:col-span-3 bg-background p-6 flex flex-col">
            <div className="mb-4 flex items-center">
              <Avatar className="h-10 w-10 mr-3">
                {friendAvatar ? (
                  <AvatarImage src={friendAvatar} />
                ) : (
                  <AvatarFallback>{friendName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h3 className="font-medium">{friendName}</h3>
                <p className="text-xs text-muted-foreground">
                  Shared {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            <Card className="flex-1 mb-4 shadow-none border">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold leading-tight">{bookmark.title}</h2>
                    <a 
                      href={bookmark.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  </div>
                  
                  {bookmark.description && (
                    <p className="text-muted-foreground text-sm">{bookmark.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {bookmark.tags && bookmark.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyBookmark(bookmark)}
              >
                <BookmarkPlus className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onCreateBitFromBookmark(bookmark)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Bit
              </Button>
            </div>
          </div>
          
          {/* Right side - Related Bits */}
          <div className="md:col-span-4 bg-muted/10 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Related Bits</h3>
              
              {relatedBits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center bg-muted/40 rounded-full p-3 mb-3">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium">No Related Bits</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    No bits have been created from this bookmark yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relatedBits.map(bit => (
                    <Card key={bit.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row">
                        {bit.image_url && (
                          <div className="sm:w-1/3">
                            <img 
                              src={bit.image_url} 
                              alt={bit.title} 
                              className="w-full h-40 sm:h-full object-cover" 
                            />
                          </div>
                        )}
                        <div className={`p-4 flex flex-col ${bit.image_url ? 'sm:w-2/3' : 'w-full'}`}>
                          <h4 className="text-base font-semibold mb-1">{bit.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{bit.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {bit.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-auto">
                            Created {formatDistanceToNow(new Date(bit.created_at), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookmarkDetailModal;
