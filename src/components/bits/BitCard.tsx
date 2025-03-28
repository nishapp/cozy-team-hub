
import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Clock, BookmarkPlus, MoreHorizontal } from "lucide-react";

// Define the Bit type
interface Bit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
}

interface BitCardProps {
  bit: Bit;
}

const BitCard: React.FC<BitCardProps> = ({ bit }) => {
  // Format the date
  const formattedDate = new Date(bit.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative">
      <div className="overflow-hidden pinterest-rounded shadow-sm hover:shadow-lg transition-all duration-300">
        {bit.image_url && (
          <AspectRatio ratio={bit.image_url.includes("unsplash") ? 4/5 : 1} className="bg-muted">
            <img 
              src={bit.image_url} 
              alt={bit.title} 
              className="object-cover w-full h-full pinterest-rounded"
            />
          </AspectRatio>
        )}
        
        {!bit.image_url && (
          <div className={`p-4 pinterest-rounded bg-white dark:bg-gray-800`}>
            <h3 className="font-semibold text-lg mb-2">{bit.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {bit.description}
            </p>
            
            {bit.wdylt_comment && (
              <div className="bg-muted p-2 rounded-xl text-sm italic text-muted-foreground">
                <span className="font-medium text-primary">@WDYLT:</span> {bit.wdylt_comment}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Pinterest-style hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow-sm">
            <BookmarkPlus size={16} />
          </Button>
          <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow-sm">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>
      
      {/* Title overlay for images */}
      {bit.image_url && (
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="font-medium text-sm text-gray-800 dark:text-white backdrop-blur-md bg-white/70 dark:bg-black/70 p-2 rounded-xl line-clamp-2">
            {bit.title}
          </h3>
        </div>
      )}
    </div>
  );
};

export default BitCard;
