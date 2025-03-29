
import React, { useState, useRef } from 'react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bookmark, Copy, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface BookmarkSummaryProps {
  summary: string;
  url: string;
  heroImage?: string | null;
  onConvertToBit: () => void;
}

const BookmarkSummary: React.FC<BookmarkSummaryProps> = ({
  summary,
  url,
  heroImage,
  onConvertToBit,
}) => {
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard");
  };

  const handleTextToSpeech = async () => {
    setIsAudioLoading(true);
    
    try {
      // Limit text length to avoid issues with large summaries
      let textToConvert = summary;
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
    <div className="flex flex-col space-y-4 p-4">
      {heroImage && (
        <div className="w-full max-h-48 overflow-hidden rounded-lg">
          <img
            src={heroImage}
            alt="Page preview"
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleTextToSpeech}
          disabled={isAudioLoading}
          className="flex items-center gap-1"
        >
          {isAudioLoading ? 
            <RefreshCw className="h-4 w-4 animate-spin" /> : 
            <Volume2 className="h-4 w-4" />
          }
          <span>Listen</span>
        </Button>
        
        {audioUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudioPlayback}
            className="flex items-center gap-1"
          >
            {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
        )}
        
        <audio 
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          className="hidden"
          controls
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyToClipboard}
          className="flex items-center gap-1"
        >
          <Copy className="h-4 w-4" />
          <span>Copy</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onConvertToBit}
          className="flex items-center gap-1"
        >
          <Bookmark className="h-4 w-4" />
          <span>Convert to Bit</span>
        </Button>
      </div>
      
      <Separator />
      
      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {summary}
      </div>
      
      <Separator />
      
      <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          {url}
        </a>
      </div>
    </div>
  );
};

export default BookmarkSummary;
