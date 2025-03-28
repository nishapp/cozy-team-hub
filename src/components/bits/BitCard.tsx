
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Clock, MessageCircle, Heart, Share2, BookmarkPlus, Image } from "lucide-react";
import EditBitButton from "./EditBitButton";

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
  onBitUpdated?: (bit: Bit) => void;
}

const BitCard: React.FC<BitCardProps> = ({ bit, onBitUpdated }) => {
  // Format the date
  const formattedDate = new Date(bit.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Truncate description if it's too long
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Generate a gradient based on the bit's category
  const getGradientColor = (category: string) => {
    const gradients = {
      "coding": "from-blue-400 to-indigo-500",
      "health": "from-green-400 to-emerald-500",
      "hobbies": "from-yellow-300 to-amber-500",
      "reading": "from-orange-400 to-pink-500",
      "default": "from-purple-400 to-pink-500"
    };
    
    return gradients[category as keyof typeof gradients] || gradients.default;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group rounded-xl border-0 saas-shadow relative">
      {onBitUpdated && <EditBitButton bit={bit} onBitUpdated={onBitUpdated} />}
      
      {bit.image_url ? (
        <AspectRatio ratio={4/3} className="bg-muted">
          <img 
            src={bit.image_url} 
            alt={bit.title} 
            className="object-cover w-full h-full rounded-t-xl transition-transform duration-300 group-hover:scale-105"
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={4/3} className={`bg-gradient-to-br ${getGradientColor(bit.category)} rounded-t-xl flex items-center justify-center text-white/80`}>
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Image className="w-10 h-10 mb-2 opacity-70" />
            <p className="text-sm font-medium">{bit.category}</p>
          </div>
        </AspectRatio>
      )}
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2">{bit.title}</h3>
          
          <span className="text-xs text-muted-foreground flex items-center">
            <Clock size={12} className="mr-1" />
            {formattedDate}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {bit.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {bit.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="rounded-full text-xs font-normal">
              {tag}
            </Badge>
          ))}
          {bit.tags.length > 3 && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Badge variant="outline" className="rounded-full text-xs font-normal cursor-pointer">
                  +{bit.tags.length - 3}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto">
                <div className="flex flex-wrap gap-1">
                  {bit.tags.slice(3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="rounded-full text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        
        {bit.wdylt_comment && (
          <div className="bg-muted p-2 rounded-lg text-sm italic text-muted-foreground mt-2">
            <span className="font-medium text-primary">@WDYLT:</span> {bit.wdylt_comment}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-1 flex justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Heart size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <MessageCircle size={16} />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <BookmarkPlus size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
            <Share2 size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BitCard;
