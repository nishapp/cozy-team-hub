import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
  id?: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at?: string;
  shared_by?: string; // Add shared_by as optional
}

interface HeaderAddBitButtonProps {
  onBitAdded: (bit: Bit) => void;
}

const HeaderAddBitButton: React.FC<HeaderAddBitButtonProps> = ({ onBitAdded }) => {
  const [open, setOpen] = React.useState(false);
  
  const handleSubmit = (data: Bit) => {
    // Add created_at timestamp
    const newBit = {
      ...data,
      created_at: new Date().toISOString(),
    };
    
    onBitAdded(newBit);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="h-9 w-9 border-[3px] border-black dark:border-white bg-background hover:bg-primary/10"
        >
          <Plus className="h-6 w-6 text-black dark:text-white stroke-[3px]" />
          <span className="sr-only">Add Bit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Bit</DialogTitle>
        </DialogHeader>
        <BitForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default HeaderAddBitButton;
