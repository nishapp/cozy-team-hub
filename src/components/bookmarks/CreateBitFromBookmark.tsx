
import React from 'react';
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BitForm from "@/components/bits/BitForm";
import { toast } from "sonner";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  isPublic: boolean;
  folderId: string;
  createdAt: string;
}

interface CreateBitFromBookmarkProps {
  bookmark: Bookmark;
}

const CreateBitFromBookmark: React.FC<CreateBitFromBookmarkProps> = ({ bookmark }) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSubmit = (data: any) => {
    // In a real app, this would save the bit to the database
    // For now, we'll just show a success message
    toast.success("Bit created from bookmark!");
    setOpen(false);
  };

  const initialData = {
    title: bookmark.title,
    description: `Created from bookmark: ${bookmark.title}`,
    link: bookmark.url,
    visibility: bookmark.isPublic ? "public" : "private",
    category: "other",
    tags: "bookmark",
    bookmarked: true
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          title="Create Bit from Bookmark"
        >
          <Code className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Bit from Bookmark</DialogTitle>
        </DialogHeader>
        <BitForm 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateBitFromBookmark;
