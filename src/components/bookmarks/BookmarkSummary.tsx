
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BookmarkItem } from "@/types/bookmark";
import { useToast } from "@/hooks/use-toast";

interface BookmarkSummaryProps {
  bookmark: BookmarkItem;
}

export function BookmarkSummary({ bookmark }: BookmarkSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: bookmark.url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      
      toast({
        title: "Summary Generated",
        description: "The webpage content has been successfully summarized.",
      });
    } catch (err) {
      console.error('Error generating summary:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Summary Failed",
        description: err instanceof Error ? err.message : 'Failed to generate summary',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {!summary && !loading && !error && (
        <Button 
          onClick={generateSummary} 
          className="w-full"
        >
          Generate Page Summary
        </Button>
      )}

      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Generating summary...</span>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 p-4 rounded-md">
          <h3 className="font-semibold text-destructive">Error</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateSummary} 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      {summary && (
        <div className="bg-muted p-4 rounded-md">
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-sm">{summary}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSummary(null)} 
            className="mt-2"
          >
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
