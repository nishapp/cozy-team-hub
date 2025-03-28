
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Bold, Italic, List, ListOrdered, Quote, Code, Underline, Image, Link } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (url: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onImageUpload,
  placeholder = "Write here. You can also include @mentions."
}) => {
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  // Set initial content and mark initial render as done
  useEffect(() => {
    if (isInitialRender && editorRef.current) {
      editorRef.current.innerHTML = value;
      setIsInitialRender(false);
    }
  }, [value, isInitialRender]);

  // Handle formatting commands
  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateValue();
    // Ensure focus is maintained
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Update the parent component with the editor's content
  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    try {
      const file = e.target.files[0];
      const imageUrl = await uploadImage(file, user.id);
      
      if (imageUrl) {
        // Preserve selection before inserting
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        
        // Insert image at cursor position
        const imgHtml = `<img src="${imageUrl}" alt="Uploaded image" class="my-2 rounded-md max-w-full" />`;
        document.execCommand('insertHTML', false, imgHtml);
        updateValue();
        
        // Also pass the URL up if needed
        if (onImageUpload) {
          onImageUpload(imageUrl);
        }
        
        // Restore focus
        if (editorRef.current) {
          editorRef.current.focus();
        }
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/30 border-b">
        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('bold')}
          >
            <Bold size={18} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('italic')}
          >
            <Italic size={18} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('underline')}
          >
            <Underline size={18} />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('insertUnorderedList')}
          >
            <List size={18} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('insertOrderedList')}
          >
            <ListOrdered size={18} />
          </Button>
        </div>

        <div className="flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('formatBlock', '<blockquote>')}
          >
            <Quote size={18} />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => handleCommand('formatBlock', '<pre>')}
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
              if (url) handleCommand('createLink', url);
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

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] outline-none"
        contentEditable
        onInput={updateValue}
        onBlur={updateValue}
        data-placeholder={placeholder}
        style={{ 
          position: 'relative',
        }}
      />
      {/* Add placeholder with CSS */}
      {!value && (
        <div 
          className="absolute pointer-events-none text-muted-foreground p-4"
          style={{ 
            top: 0, 
            marginTop: '4.5rem', // Adjust this value to properly position the placeholder
            zIndex: 1 
          }}
        >
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
