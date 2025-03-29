
import React, { useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import BitDetailModal from "@/components/bits/BitDetailModal";
import { toast } from "sonner";

type SharedBit = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
  shared_by: string;
  author_avatar?: string;
  friend_count?: number;
};

interface SharedBitsCarouselProps {
  sharedBits: SharedBit[];
}

const SharedBitsCarousel: React.FC<SharedBitsCarouselProps> = ({ sharedBits }) => {
  const [selectedBit, setSelectedBit] = useState<SharedBit | null>(null);
  
  if (!sharedBits || sharedBits.length === 0) {
    return null;
  }

  const handleShareClick = (bit: SharedBit) => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(`Check out this bit: ${bit.title}`).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy link");
    });
  };
  
  const handleBitClick = (bit: SharedBit) => {
    setSelectedBit(bit);
  };

  const handleBitUpdated = () => {
    // This is a placeholder function since shared bits are read-only in this context
    // However, we need to pass this prop to BitDetailModal
    toast.success("Bit interaction recorded!");
  };

  return (
    <div className="py-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-4">Shared by your buddies</h2>
        <p className="text-muted-foreground">Interesting bits shared by people you follow</p>
      </div>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {sharedBits.map((bit) => (
            <CarouselItem key={bit.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1">
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleBitClick(bit)}>
                  {bit.image_url && (
                    <div className="relative w-full aspect-[4/3] overflow-hidden">
                      <img 
                        src={bit.image_url} 
                        alt={bit.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardContent className={`p-4 ${!bit.image_url ? 'pt-6' : ''}`}>
                    <h3 className="font-semibold line-clamp-2">{bit.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {bit.description}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={bit.author_avatar} />
                        <AvatarFallback>{bit.shared_by.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{bit.shared_by}</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareClick(bit);
                      }}
                    >
                      <Share className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
      
      {selectedBit && (
        <BitDetailModal
          bit={selectedBit}
          isOpen={!!selectedBit}
          onClose={() => setSelectedBit(null)}
          onBitUpdated={handleBitUpdated}
        />
      )}
    </div>
  );
};

export default SharedBitsCarousel;
