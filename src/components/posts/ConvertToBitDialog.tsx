
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import BitForm from "@/components/bits/BitForm";
import { toast } from "sonner";

interface ConvertToBitDialogProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

const ConvertToBitDialog = ({ post, isOpen, onClose }: ConvertToBitDialogProps) => {
  const [mode, setMode] = useState<"confirm" | "form">("confirm");
  const navigate = useNavigate();

  const createInitialBitData = () => {
    // Extract first paragraph or portion of content for description
    const description = post.content.split('\n')[0].slice(0, 200);
    
    // Extract potential tags from the content
    const extractTags = () => {
      const commonWords = ["the", "and", "a", "is", "in", "to", "of", "for", "with", "on"];
      const words = post.content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
      
      // Count word frequencies
      const wordCount = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Get top 3 words as potential tags
      return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word);
    };
    
    // The problem is here - we're returning a string for tags
    // but BitForm expects an array. Let's fix this by returning an array directly
    // instead of joining it into a string
    return {
      title: post.title,
      description: description,
      tags: extractTags(), // Return as array, not as string
      category: "",
      visibility: "public",
      wdylt_comment: "",
      image_url: "",
      link: "",
    };
  };

  const handleProceed = () => {
    setMode("form");
  };

  const handleBitSubmit = (bitData: any) => {
    // In a real app, we would create the bit in the database
    toast.success("Post converted to bit successfully!");
    onClose();
    navigate('/bits');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[${mode === "form" ? '700' : '500'}px] max-h-[90vh] overflow-y-auto`}>
        {mode === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>Convert Post to Bit</DialogTitle>
              <DialogDescription>
                Converting this post will create a new bit with content extracted from your post.
                You can customize the bit's details in the next step.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h3 className="font-medium mb-2">Post to convert:</h3>
              <p className="font-semibold">{post.title}</p>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.content}</p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleProceed}>Continue</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Customize Your Bit</DialogTitle>
              <DialogDescription>
                Customize the details of your bit below.
              </DialogDescription>
            </DialogHeader>
            
            <BitForm 
              onSubmit={handleBitSubmit} 
              onCancel={onClose} 
              initialData={createInitialBitData()}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToBitDialog;
