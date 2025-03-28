
import React, { useState, useRef, useEffect } from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/context/AuthContext";
import EditorToolbar from "./EditorToolbar";
import EditorContent from "./EditorContent";

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
      <EditorToolbar 
        onCommand={handleCommand}
        handleImageUpload={handleImageUpload}
        uploading={uploading}
      />
      <EditorContent
        editorRef={editorRef}
        updateValue={updateValue}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
};

export default RichTextEditor;
