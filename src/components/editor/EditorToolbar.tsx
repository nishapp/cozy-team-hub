
import React from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Quote, Code, Underline, Image, Link, Loader2 } from "lucide-react";

interface EditorToolbarProps {
  onCommand: (command: string, value?: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onCommand,
  handleImageUpload,
  uploading
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b">
      <div className="flex gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('bold')}
        >
          <Bold size={18} />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('italic')}
        >
          <Italic size={18} />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('underline')}
        >
          <Underline size={18} />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('insertUnorderedList')}
        >
          <List size={18} />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('insertOrderedList')}
        >
          <ListOrdered size={18} />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('formatBlock', '<blockquote>')}
        >
          <Quote size={18} />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => onCommand('formatBlock', '<pre>')}
        >
          <Code size={18} />
        </Button>
      </div>

      <div className="flex gap-1">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) onCommand('createLink', url);
          }}
        >
          <Link size={18} />
        </Button>
        
        <div className="relative">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Image size={18} />
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
