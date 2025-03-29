
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
import { handleGenerateTagsRequest } from "@/mock/api/generate-tags";

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

  // Get the current domain + path to the post for use as the bit link
  const getBookmarkUrl = () => {
    return bookmark.url;
  };

  const createInitialBitData = (tags: string[] = []) => {
    // Extract content for description
    const description = bookmark.summary || bookmark.description || bookmark.title;
    
    return {
      title: bookmark.title,
      description: description.slice(0, 500), // Limit description length
      tags: tags.join(", "),
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
      // Prepare content for tag generation
      const content = `${bookmark.title} ${bookmark.description || ''} ${bookmark.summary || ''}`;
      
      // Use our mock tag generation API
      const result = await handleGenerateTagsRequest(content);
      console.log("AI generated tags:", result.tags);
      
      // Use the bookmark's content to generate data
      const aiGeneratedData = createInitialBitData(result.tags);
      
      console.log("Generated bit data:", aiGeneratedData);
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
