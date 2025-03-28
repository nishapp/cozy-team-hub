
import React, { RefObject } from "react";

interface EditorContentProps {
  editorRef: RefObject<HTMLDivElement>;
  updateValue: () => void;
  placeholder: string;
  value: string;
}

const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  updateValue,
  placeholder,
  value
}) => {
  return (
    <>
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] outline-none"
        contentEditable
        onInput={updateValue}
        onBlur={updateValue}
        data-placeholder={placeholder}
        style={{ position: 'relative' }}
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
    </>
  );
};

export default EditorContent;
