import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Link, X, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface BitDetailModalProps {
  bit: any;
  isOpen: boolean;
  onClose: () => void;
  onBitUpdated: (bit: any) => void;
}

const BitDetailModal: React.FC<BitDetailModalProps> = ({ bit, isOpen, onClose, onBitUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(bit.title);
  const [description, setDescription] = useState(bit.description);
  const [tags, setTags] = useState(bit.tags.join(", "));
  const [category, setCategory] = useState(bit.category);
  const [visibility, setVisibility] = useState(bit.visibility);
  const [wdyltComment, setWdyltComment] = useState(bit.wdylt_comment || "");
  const [imageUrl, setImageUrl] = useState(bit.image_url || "");
  const [link, setLink] = useState(bit.link || "");
  
  // Audio states
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = [
    "coding",
    "reading",
    "wellness",
    "hobbies",
    "productivity",
    "finance",
    "travel",
    "music",
  ];

  const handleUpdateBit = () => {
    const updatedBit = {
      ...bit,
      title,
      description,
      tags: tags.split(",").map((tag: string) => tag.trim()),
      category,
      visibility,
      wdylt_comment: wdyltComment,
      image_url: imageUrl,
      link,
    };
    onBitUpdated(updatedBit);
    setIsEditing(false);
    onClose();
  };
  
  const handleTextToSpeech = async () => {
    if (!bit.description && !bit.summary) return;
    
    setIsAudioLoading(true);
    
    try {
      let textToConvert = bit.summary || bit.description;
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90%] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Bit" : bit.title}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the bit details." : "View bit details."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-100px)]">
          <div className="grid gap-4 py-4">
            {!isEditing ? (
              <>
                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Title</Label>
                  <div className="col-span-2 font-semibold">{bit.title}</div>
                </div>

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Description</Label>
                  <div className="col-span-2 text-muted-foreground">
                    {bit.description}
                    {bit.description && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleTextToSpeech}
                          disabled={isAudioLoading}
                          className="flex items-center space-x-1"
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
                            className="flex items-center space-x-1"
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
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Tags</Label>
                  <div className="col-span-2">
                    {bit.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="mr-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Category</Label>
                  <div className="col-span-2">{bit.category}</div>
                </div>

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Visibility</Label>
                  <div className="col-span-2">{bit.visibility}</div>
                </div>

                {bit.wdylt_comment && (
                  <div className="grid grid-cols-3 items-start gap-4">
                    <Label className="text-right">Comment</Label>
                    <div className="col-span-2">{bit.wdylt_comment}</div>
                  </div>
                )}

                {bit.image_url && (
                  <div className="grid grid-cols-3 items-start gap-4">
                    <Label className="text-right">Image</Label>
                    <div className="col-span-2">
                      <img
                        src={bit.image_url}
                        alt={bit.title}
                        className="rounded-md max-h-40 object-cover"
                      />
                    </div>
                  </div>
                )}

                {bit.link && (
                  <div className="grid grid-cols-3 items-start gap-4">
                    <Label className="text-right">Link</Label>
                    <div className="col-span-2">
                      <a
                        href={bit.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        <Link className="mr-1 h-4 w-4 inline-block align-middle" />
                        {bit.link}
                      </a>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Shared By</Label>
                  <div className="col-span-2">{bit.shared_by || "You"}</div>
                </div>

                <div className="grid grid-cols-3 items-start gap-4">
                  <Label className="text-right">Created At</Label>
                  <div className="col-span-2">
                    {new Date(bit.created_at).toLocaleDateString()}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory} >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="visibility" className="text-right">
                    Visibility
                  </Label>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="wdyltComment" className="text-right">
                    Comment
                  </Label>
                  <Textarea
                    id="wdyltComment"
                    value={wdyltComment}
                    onChange={(e) => setWdyltComment(e.target.value)}
                    className="col-span-3 min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="imageUrl" className="text-right">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="link" className="text-right">
                    Link
                  </Label>
                  <Input
                    id="link"
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          {!isEditing ? (
            <div className="flex justify-between w-full">
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBit}>Update</Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BitDetailModal;
