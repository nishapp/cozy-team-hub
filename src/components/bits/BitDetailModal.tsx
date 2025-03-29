
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Link, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import EditBitButton from "./EditBitButton";
import CreateBookmarkFromBit from "@/components/bookmarks/CreateBookmarkFromBit";

interface BitDetailModalProps {
  bit: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    category: string;
    visibility: string;
    wdylt_comment?: string;
    image_url?: string;
    created_at: string;
    shared_by: string;
    link?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onBitUpdated: (bit: any) => void;
}

const BitDetailModal: React.FC<BitDetailModalProps> = ({
  bit,
  isOpen,
  onClose,
  onBitUpdated,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyLink = () => {
    // In a real app, this would generate a shareable link to the bit
    navigator.clipboard.writeText(
      `${window.location.origin}/bits?id=${bit.id}`
    );
    setIsCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const categoryColors: Record<string, string> = {
    coding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    reading: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    health: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    hobbies: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{bit.title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <CreateBookmarkFromBit bit={bit} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">
                  {isCopied ? "Copied!" : "Share"}
                </span>
              </Button>
              <EditBitButton bit={bit} onBitUpdated={onBitUpdated} />
            </div>
          </div>
          <DialogDescription>
            {bit.created_at && (
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(bit.created_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {bit.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={bit.image_url}
                alt={bit.title}
                className="w-full h-auto object-cover"
                style={{ maxHeight: "300px" }}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="" />
              <AvatarFallback>
                {bit.shared_by ? getInitials(bit.shared_by) : "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{bit.shared_by}</span>
          </div>

          <div>
            <p className="whitespace-pre-line">{bit.description}</p>
          </div>

          {bit.link && (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
              <Link className="h-4 w-4" />
              <a
                href={bit.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:text-blue-800 dark:hover:text-blue-300"
              >
                {bit.link}
                <ExternalLink className="inline-block ml-1 h-3 w-3" />
              </a>
            </div>
          )}

          {bit.wdylt_comment && (
            <div className="bg-primary/5 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-1">What I learned:</h4>
              <p className="text-sm">{bit.wdylt_comment}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={categoryColors[bit.category.toLowerCase()] || ""}
            >
              {bit.category}
            </Badge>
            {bit.tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BitDetailModal;
