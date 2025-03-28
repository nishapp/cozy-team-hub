
import React, { useState } from "react";
import { BookmarkItem } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BookmarkSummaryProps {
  bookmark: BookmarkItem;
  onSaveDescription?: (bookmarkId: string, description: string) => void;
}

export function BookmarkSummary({ bookmark, onSaveDescription }: BookmarkSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarized, setIsSummarized] = useState(!!bookmark.summary);
  const [summary, setSummary] = useState(bookmark.summary || "");
  const [descriptionDraft, setDescriptionDraft] = useState(bookmark.description || "");

  const handleGenerateSummary = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: bookmark.url }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      
      if (data.summary) {
        setSummary(data.summary);
        setDescriptionDraft(data.summary);
        setIsSummarized(true);
        
        // If heroImage is returned, we'd handle it in the parent component
        toast.success('Summary generated successfully');
      } else {
        toast.error('Could not generate a summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDescription = () => {
    if (onSaveDescription) {
      onSaveDescription(bookmark.id, descriptionDraft);
      toast.success('Description saved successfully');
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {!isSummarized ? (
        <div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleGenerateSummary}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating summary...
              </>
            ) : (
              "Generate AI Summary"
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">AI Summary</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Regenerate"
              )}
            </Button>
          </div>
          
          <ScrollArea className="max-h-[200px] overflow-auto">
            <div className="p-3 bg-secondary/50 rounded-md text-sm">
              {summary}
            </div>
          </ScrollArea>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Save as Description</h3>
            <Textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              placeholder="Edit if needed before saving as description..."
              className="min-h-[100px]"
            />
            
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSaveDescription}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save as Description
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
