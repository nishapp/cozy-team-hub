import React from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import BitForm from "./BitForm";

// Update the Bit interface to include shared_by
interface Bit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
  shared_by?: string; // Add shared_by as optional
}

interface EditBitButtonProps {
  bit: Bit;
  onBitUpdated: (bit: Bit) => void;
}

const EditBitButton: React.FC<EditBitButtonProps> = ({ bit, onBitUpdated }) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSubmit = (data: Bit) => {
    // Preserve the original created_at timestamp
    const updatedBit = {
      ...data,
      id: bit.id,
      created_at: bit.created_at,
    };
    
    onBitUpdated(updatedBit);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8 absolute top-2 right-2 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Edit size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Bit</DialogTitle>
        </DialogHeader>
        <BitForm 
          initialData={bit} 
          onSubmit={handleSubmit} 
          onCancel={() => setOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditBitButton;
