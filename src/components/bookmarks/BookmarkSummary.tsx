
import React, { useState } from "react";
import { BookmarkItem } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface BookmarkSummaryProps {
  bookmark: BookmarkItem;
  onSaveDescription?: (bookmarkId: string, description: string, heroImage?: string) => void;
}

export const BookmarkSummary: React.FC<BookmarkSummaryProps> = ({
  bookmark,
  onSaveDescription,
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(
    bookmark.description || bookmark.summary || null
  );

  const summarizeBookmark = async () => {
    if (isSummarizing) return;

    setIsSummarizing(true);
    setError(null);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: bookmark.url }),
      });

      if (!response.ok) {
        throw new Error("Failed to summarize the bookmark content");
      }

      const data = await response.json();
      
      // Extract summary and hero image from response
      const extractedSummary = data.summary || "";
      const heroImage = data.heroImage || null;
      
      setSummary(extractedSummary);
      
      // Save both the summary and hero image
      if (onSaveDescription) {
        onSaveDescription(bookmark.id, extractedSummary, heroImage);
        toast.success("Summary saved to bookmark description");
      }
    } catch (err) {
      console.error("Error summarizing bookmark:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to summarize the bookmark content"
      );
      toast.error("Failed to generate summary");
    } finally {
      setIsSummarizing(false);
    }
  };

  const hasSummary = Boolean(summary);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Summary</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={summarizeBookmark}
          disabled={isSummarizing}
          className="flex items-center"
        >
          {isSummarizing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : hasSummary ? (
            <RefreshCw className="h-4 w-4 mr-2" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          {isSummarizing
            ? "Summarizing..."
            : hasSummary
            ? "Regenerate"
            : "Generate"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 p-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mr-2 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {hasSummary ? (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm whitespace-pre-line">{summary}</p>
        </div>
      ) : (
        <div className="bg-muted/50 p-3 rounded-md">
          <p className="text-sm text-muted-foreground italic">
            No summary available. Generate one to get an AI-powered description of this
            bookmark.
          </p>
        </div>
      )}
    </div>
  );
};
