
import React, { useState } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, MessageCircle, Heart, Share2, BookmarkPlus, Image, Send, X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface Comment {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  text: string;
  timestamp: string;
}

// Sample comments data
const sampleComments: Comment[] = [
  {
    id: "1",
    user: {
      name: "Emily Johnson",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    text: "This is such a great resource! I've been looking for something like this for ages.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    text: "Thanks for sharing this! Just what I needed for my project.",
    timestamp: "Yesterday",
  },
  {
    id: "3",
    user: {
      name: "Sarah Williams",
    },
    text: "I tried this technique and it worked perfectly. Highly recommend!",
    timestamp: "2 days ago",
  },
];

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
  shared_by: string;
}

interface BitDetailModalProps {
  bit: Bit;
  isOpen: boolean;
  onClose: () => void;
  onBitUpdated?: (bit: Bit) => void;
}

const BitDetailModal: React.FC<BitDetailModalProps> = ({ bit, isOpen, onClose, onBitUpdated }) => {
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [wdiltComment, setWdiltComment] = useState(bit.wdylt_comment || "");
  const [isWdiltOpen, setIsWdiltOpen] = useState(false);

  // Format the date
  const formattedDate = new Date(bit.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `temp-${Date.now()}`,
      user: {
        name: "You",
      },
      text: newComment,
      timestamp: "Just now",
    };

    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddComment();
    }
  };
  
  const handleWdiltSubmit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!wdiltComment.trim()) {
      setIsWdiltOpen(false);
      return;
    }
    
    if (onBitUpdated) {
      const updatedBit = {
        ...bit,
        wdylt_comment: wdiltComment.trim()
      };
      onBitUpdated(updatedBit);
    }
    
    toast.success("WDILT comment added!");
    setIsWdiltOpen(false);
  };

  // Generate a gradient based on the bit's category
  const getGradientColor = (category: string) => {
    const gradients = {
      "coding": "from-blue-400 to-indigo-500",
      "health": "from-green-400 to-emerald-500",
      "hobbies": "from-yellow-300 to-amber-500",
      "reading": "from-orange-400 to-pink-500",
      "photography": "from-purple-400 to-pink-500",
      "food": "from-red-400 to-pink-500",
      "gardening": "from-green-400 to-teal-500",
      "design": "from-blue-400 to-violet-500",
      "plants": "from-emerald-400 to-green-500",
      "art": "from-rose-400 to-purple-500",
      "home": "from-amber-400 to-yellow-500",
      "work": "from-cyan-400 to-blue-500",
      "default": "from-purple-400 to-pink-500"
    };
    
    return gradients[category as keyof typeof gradients] || gradients.default;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="grid md:grid-cols-2 h-full">
          {/* Left side - Image/Content */}
          <div className="relative bg-muted">
            {bit.image_url ? (
              <div className="h-full">
                <img 
                  src={bit.image_url} 
                  alt={bit.title} 
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className={`bg-gradient-to-br ${getGradientColor(bit.category)} h-full flex items-center justify-center text-white/80`}>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <Image className="w-20 h-20 mb-2 opacity-70" />
                  <p className="text-lg font-medium">{bit.category}</p>
                </div>
              </div>
            )}
            <DialogClose className="absolute top-2 left-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80">
              <X size={16} />
            </DialogClose>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
              Shared by {bit.shared_by}
            </div>
          </div>

          {/* Right side - Info and Comments */}
          <div className="flex flex-col h-full max-h-[90vh] bg-background">
            {/* Header and content */}
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold mb-2">{bit.title}</h2>
              <div className="flex items-center text-muted-foreground text-xs mb-3">
                <Clock size={12} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{bit.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {bit.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="rounded-full text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {bit.wdylt_comment && (
                <div className="bg-muted p-2 rounded-lg text-sm italic text-muted-foreground mt-2">
                  <span className="font-medium text-primary">@WDYLT:</span> {bit.wdylt_comment}
                </div>
              )}
            </div>

            {/* Comments section */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-semibold mb-4">Comments ({comments.length})</h3>
              
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      {comment.user.avatar ? (
                        <AvatarImage src={comment.user.avatar} />
                      ) : (
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions and comment input */}
            <div className="p-4 border-t">
              <div className="flex justify-between mb-3">
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full h-8 w-8 ${liked ? 'text-red-500' : ''}`}
                    onClick={() => setLiked(!liked)}
                  >
                    <Heart size={16} fill={liked ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <MessageCircle size={16} />
                  </Button>
                  
                  <Popover open={isWdiltOpen} onOpenChange={setIsWdiltOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsWdiltOpen(true);
                        }}
                      >
                        <Plus size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-72" 
                      onClick={(e) => e.stopPropagation()}
                      side="top"
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium">Add @WDYLT Comment</h4>
                        <p className="text-xs text-muted-foreground">
                          Share what you learned today about this bit
                        </p>
                        <div className="space-y-2">
                          <Input 
                            placeholder="Today I learned..." 
                            value={wdiltComment}
                            onChange={(e) => setWdiltComment(e.target.value)}
                            className="w-full"
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsWdiltOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={handleWdiltSubmit}
                            >
                              Add Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`rounded-full h-8 w-8 ${saved ? 'text-primary' : ''}`}
                    onClick={() => setSaved(!saved)}
                  >
                    <BookmarkPlus size={16} fill={saved ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Share2 size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>Y</AvatarFallback>
                </Avatar>
                <div className="relative flex-1">
                  <Input
                    placeholder="Add a comment..." 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10 rounded-full"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-full"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    <Send size={14} className={newComment.trim() ? "text-primary" : "text-muted-foreground"} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BitDetailModal;
