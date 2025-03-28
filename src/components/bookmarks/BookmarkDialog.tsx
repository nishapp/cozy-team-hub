
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Lock, LockOpen } from "lucide-react";

interface BookmarkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { title: string; url: string; description?: string; isPrivate?: boolean }) => void;
  initialValues?: { title: string; url: string; description?: string; isPrivate?: boolean };
  mode?: "create" | "edit";
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValues,
  mode = "create",
}) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [url, setUrl] = useState(initialValues?.url || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate || false);
  const [error, setError] = useState<{title?: string; url?: string}>({});

  useEffect(() => {
    if (isOpen) {
      setTitle(initialValues?.title || "");
      setUrl(initialValues?.url || "");
      setDescription(initialValues?.description || "");
      setIsPrivate(initialValues?.isPrivate || false);
      setError({});
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {title?: string; url?: string} = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!url.trim()) {
      newErrors.url = "URL is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    
    onConfirm({ 
      title: title.trim(), 
      url: url.trim(),
      description: description.trim() || undefined,
      isPrivate,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add New Bookmark" : "Edit Bookmark"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Add a new bookmark to your collection."
                : "Update the bookmark details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., MDN Web Docs"
                autoFocus
              />
              {error.title && <p className="text-destructive text-sm">{error.title}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., https://developer.mozilla.org"
              />
              {error.url && <p className="text-destructive text-sm">{error.url}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this bookmark about?"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="privacy-mode"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
              <Label htmlFor="privacy-mode" className="flex items-center cursor-pointer">
                {isPrivate ? (
                  <Lock className="h-4 w-4 mr-2 text-amber-500" />
                ) : (
                  <LockOpen className="h-4 w-4 mr-2 text-green-500" />
                )}
                {isPrivate ? "Private (Only you can see this)" : "Public (Visible to buddies)"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {mode === "create" ? "Add Bookmark" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
