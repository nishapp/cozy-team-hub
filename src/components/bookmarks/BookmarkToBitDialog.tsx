
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkItem } from "@/types/bookmark";
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
import { Sparkles, Loader2 } from "lucide-react";

interface BookmarkToBitDialogProps {
  bookmark: BookmarkItem;
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkToBitDialog = ({ bookmark, isOpen, onClose }: BookmarkToBitDialogProps) => {
  const [mode, setMode] = useState<"confirm" | "form">("confirm");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const navigate = useNavigate();

  // Get suggested tags based on title, description and summary
  const generateSuggestedTags = () => {
    // Default fallback if AI fails
    const extractTagsManually = () => {
      const content = `${bookmark.title} ${bookmark.description || ''} ${bookmark.summary || ''}`;
      const commonWords = ["the", "and", "a", "is", "in", "to", "of", "for", "with", "on"];
      const words = content
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.includes(word));
      
      // Count word frequencies
      const wordCount = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Get top 3-5 words as potential tags
      return Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
    };

    return extractTagsManually();
  };

  // Get the current domain + path to the post for use as the bit link
  const getBookmarkUrl = () => {
    return bookmark.url;
  };

  const createInitialBitData = () => {
    // Extract content for description
    const description = bookmark.summary || bookmark.description || bookmark.title;
    
    return {
      title: bookmark.title,
      description: description.slice(0, 500), // Limit description length
      tags: generateSuggestedTags().join(", "),
      category: "",
      visibility: "public",
      wdylt_comment: "",
      image_url: bookmark.imageUrl || "",
      link: getBookmarkUrl(),
    };
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an API to generate tags
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use the bookmark's content to generate data
      const aiGeneratedData = {
        ...createInitialBitData(),
        // In a real implementation, these would come from the AI API
        tags: generateSuggestedTags().join(", ")
      };
      
      setGeneratedData(aiGeneratedData);
      setMode("form");
      toast.success("AI has helped prepare your bit!");
    } catch (error) {
      console.error("Error generating with AI:", error);
      toast.error("Couldn't generate with AI, but you can still create a bit manually");
      
      // Fall back to manual creation with basic data
      setGeneratedData(createInitialBitData());
      setMode("form");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBitSubmit = (bitData: any) => {
    // In a real app, we would create the bit in the database
    toast.success("Bookmark converted to bit successfully!");
    onClose();
    navigate('/bits');
  };

  const handleCancelDialog = () => {
    setMode("confirm");
    setGeneratedData(null);
    onClose();
  };

  if (!bookmark) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancelDialog}>
      <DialogContent className={`sm:max-w-[${mode === "form" ? '700' : '500'}px] max-h-[90vh] overflow-y-auto`}>
        {mode === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>Convert Bookmark to Bit</DialogTitle>
              <DialogDescription>
                Let AI help you create a new bit from this bookmark. The AI will suggest tags and use the existing bookmark data.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <h3 className="font-medium mb-2">Bookmark to convert:</h3>
              <p className="font-semibold">{bookmark.title}</p>
              {bookmark.imageUrl && (
                <div className="mt-2 mb-4">
                  <img 
                    src={bookmark.imageUrl} 
                    alt={bookmark.title} 
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              {bookmark.description && (
                <div className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {bookmark.description}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDialog}>Cancel</Button>
              <Button 
                onClick={handleGenerateWithAI} 
                disabled={isGenerating}
                className="flex items-center gap-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Customize Your Bit</DialogTitle>
              <DialogDescription>
                The AI has prepared your bit with suggested tags and content. You can edit the details below before submitting.
              </DialogDescription>
            </DialogHeader>
            
            <BitForm 
              onSubmit={handleBitSubmit} 
              onCancel={handleCancelDialog} 
              initialData={generatedData}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
