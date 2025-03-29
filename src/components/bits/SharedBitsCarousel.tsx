
import React, { useState } from "react";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Bookmark, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Share, 
  User 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BitDetailModal from "./BitDetailModal";
import { toast } from "sonner";

// Type definition for a shared bit
interface SharedBit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  link?: string;
  created_at: string;
  shared_by: string;
  author_avatar?: string;
  friend_count?: number;
}

const mockSharedBits: SharedBit[] = [
  {
    id: "1",
    title: "Discovered a great new React pattern",
    description: "I've been using this new pattern for state management and it's really simplified my code.",
    tags: ["react", "programming", "web-dev"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Today I learned about React's useReducer hook!",
    created_at: "2025-03-10T10:00:00Z",
    shared_by: "Jane Smith",
    author_avatar: "https://i.pravatar.cc/150?img=1",
    friend_count: 5
  },
  {
    id: "2",
    title: "New book recommendation",
    description: "Just finished 'Atomic Habits' - probably the best productivity book I've read this year.",
    tags: ["books", "productivity", "self-improvement"],
    category: "reading",
    visibility: "public",
    image_url: "https://images-na.ssl-images-amazon.com/images/I/81wgcld4wxL.jpg",
    created_at: "2025-03-09T15:30:00Z",
    shared_by: "Mark Johnson",
    author_avatar: "https://i.pravatar.cc/150?img=2",
    link: "https://jamesclear.com/atomic-habits",
    friend_count: 12
  },
  {
    id: "3",
    title: "My meditation journey",
    description: "I've been meditating daily for 30 days now, and here's what I've learned about mindfulness and focus.",
    tags: ["meditation", "mindfulness", "health"],
    category: "wellness",
    visibility: "public",
    wdylt_comment: "Consistency is key for building new habits!",
    created_at: "2025-03-08T08:15:00Z",
    shared_by: "Sarah Williams",
    author_avatar: "https://i.pravatar.cc/150?img=5",
    friend_count: 8
  },
  {
    id: "4",
    title: "Useful TypeScript tricks",
    description: "A collection of TypeScript patterns that have made my code more robust.",
    tags: ["typescript", "programming", "tips"],
    category: "coding",
    visibility: "public",
    link: "https://www.typescriptlang.org/docs/",
    created_at: "2025-03-07T14:20:00Z",
    shared_by: "David Chen",
    author_avatar: "https://i.pravatar.cc/150?img=4",
    friend_count: 15
  }
];

const SharedBitsCarousel: React.FC = () => {
  const [selectedBit, setSelectedBit] = useState<SharedBit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likedBits, setLikedBits] = useState<string[]>([]);
  const [bookmarkedBits, setBookmarkedBits] = useState<string[]>([]);

  const handleToggleLike = (bitId: string) => {
    if (likedBits.includes(bitId)) {
      setLikedBits(likedBits.filter(id => id !== bitId));
    } else {
      setLikedBits([...likedBits, bitId]);
      toast.success("Added to your liked bits!");
    }
  };

  const handleToggleBookmark = (bitId: string) => {
    if (bookmarkedBits.includes(bitId)) {
      setBookmarkedBits(bookmarkedBits.filter(id => id !== bitId));
    } else {
      setBookmarkedBits([...bookmarkedBits, bitId]);
      toast.success("Bit bookmarked successfully!");
    }
  };

  const openBitDetail = (bit: SharedBit) => {
    setSelectedBit(bit);
    setIsModalOpen(true);
  };

  const closeBitDetail = () => {
    setIsModalOpen(false);
    setSelectedBit(null);
  };

  const handleBitUpdated = (updatedBit: any) => {
    // In a real implementation, this would update the bit in the state or trigger a refetch
    toast.success("Bit updated successfully!");
    // For now, we'll just close the modal
    closeBitDetail();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full my-6">
      <h2 className="text-2xl font-bold mb-4">Shared by Friends</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {mockSharedBits.map((bit) => (
            <CarouselItem key={bit.id} className="sm:basis-1/2 lg:basis-1/3">
              <Card className="h-full flex flex-col">
                <CardContent className="p-4 flex-grow">
                  <div className="flex items-center mb-3">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={bit.author_avatar} alt={bit.shared_by} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{bit.shared_by}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(bit.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2 cursor-pointer" onClick={() => openBitDetail(bit)}>
                    <h3 className="font-semibold">{bit.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                      {bit.description}
                    </p>
                    
                    {bit.image_url && (
                      <div className="w-full h-32 mb-2 overflow-hidden rounded-md">
                        <img 
                          src={bit.image_url} 
                          alt={bit.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {bit.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="px-4 py-2 border-t flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleToggleLike(bit.id)}
                      className={likedBits.includes(bit.id) ? "text-red-500" : ""}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleToggleBookmark(bit.id)}
                    className={bookmarkedBits.includes(bit.id) ? "text-primary" : ""}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
      
      {selectedBit && (
        <BitDetailModal 
          bit={selectedBit} 
          isOpen={isModalOpen} 
          onClose={closeBitDetail}
          onBitUpdated={handleBitUpdated}
        />
      )}
    </div>
  );
};

export default SharedBitsCarousel;
