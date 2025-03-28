
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

// Define the Bit type
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
}

interface AddBitButtonProps {
  onBitAdded: (bit: Bit) => void;
}

const AddBitButton: React.FC<AddBitButtonProps> = ({ onBitAdded }) => {
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
          size="sm" 
          className="gap-1 rounded-full fixed bottom-6 right-6 shadow-lg z-10 border-[2.5px] border-black bg-primary"
        >
          <Plus size={20} className="text-black stroke-[2.5px]" />
          <span className="hidden sm:inline">Add Bit</span>
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

export default AddBitButton;
