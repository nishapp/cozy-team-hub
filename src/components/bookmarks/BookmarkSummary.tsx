
import React, { useState, useRef } from "react";
import { BookmarkItem } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, CheckCircle2, VolumeX, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { isDemoMode } from "@/lib/supabase";

interface BookmarkSummaryProps {
  bookmark: BookmarkItem;
  onSaveDescription?: (bookmarkId: string, description: string) => void;
}

export function BookmarkSummary({ bookmark, onSaveDescription }: BookmarkSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarized, setIsSummarized] = useState(!!bookmark.summary);
  const [summary, setSummary] = useState(bookmark.summary || "");
  const [descriptionDraft, setDescriptionDraft] = useState(bookmark.description || "");
  
  // Audio states
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleTextToSpeech = async () => {
    if (!summary || isAudioLoading) return;
    
    setIsAudioLoading(true);
    
    try {
      let textToConvert = summary;
      // Limit text length to avoid issues with large summaries
      if (textToConvert.length > 3000) {
        textToConvert = textToConvert.substring(0, 3000) + "...";
      }
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: textToConvert }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to convert text to speech');
      }
      
      if (data && data.audio) {
        // Convert base64 to Blob
        const byteCharacters = atob(data.audio);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: 'audio/mpeg' });
        
        // Create audio URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Auto-play if needed
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
        }
        
        toast.success('Audio generated successfully');
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Error converting text to speech:', error);
      toast.error('Failed to generate audio');
    } finally {
      setIsAudioLoading(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
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
            <div className="flex space-x-2">
              {!isDemoMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTextToSpeech}
                  disabled={isAudioLoading}
                  title="Listen to summary"
                >
                  {isAudioLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              )}
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
          </div>
          
          <div className="p-3 bg-secondary/50 rounded-md text-sm max-h-[200px] overflow-auto">
            {summary}
          </div>
          
          {audioUrl && (
            <div className="flex items-center space-x-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAudioPlayback}
                className="flex items-center space-x-1"
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>
              <audio 
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
                controls
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Save as Description</h3>
            <Textarea
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              placeholder="Edit if needed before saving as description..."
              className="min-h-[100px] max-h-[150px]"
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
