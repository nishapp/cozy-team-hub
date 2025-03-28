
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookmarkFolder } from "@/types/bookmark";
import { Switch } from "@/components/ui/switch";
import { Lock, LockOpen } from "lucide-react";

interface FolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate?: boolean;
  }) => void;
  initialValues?: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate?: boolean;
  };
  parentFolders: BookmarkFolder[];
  currentParentId?: string | null;
  mode?: "create" | "edit";
}

export const FolderDialog: React.FC<FolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValues,
  parentFolders,
  currentParentId = null,
  mode = "create",
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [parentId, setParentId] = useState<string | null>(initialValues?.parentId !== undefined ? initialValues.parentId : currentParentId);
  const [isPrivate, setIsPrivate] = useState(initialValues?.isPrivate || false);
  const [error, setError] = useState<{name?: string}>({});

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name || "");
      setDescription(initialValues?.description || "");
      setParentId(initialValues?.parentId !== undefined ? initialValues.parentId : currentParentId);
      setIsPrivate(initialValues?.isPrivate || false);
      setError({});
    }
  }, [isOpen, initialValues, currentParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {name?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }
    
    onConfirm({ 
      name: name.trim(), 
      description: description.trim() || undefined,
      parentId,
      isPrivate,
    });
  };

  // Create a flat list for the folder selector
  const getFolderList = (folders: BookmarkFolder[], level = 0, result: { id: string; name: string; level: number }[] = []) => {
    folders.forEach(folder => {
      result.push({
        id: folder.id,
        name: folder.name,
        level,
      });
      
      // Get child folders
      const childFolders = parentFolders.filter(f => f.parentId === folder.id);
      if (childFolders.length > 0) {
        getFolderList(childFolders, level + 1, result);
      }
    });
    return result;
  };

  const rootFolders = parentFolders.filter(folder => !folder.parentId);
  const folderList = getFolderList(rootFolders);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create New Folder" : "Edit Folder"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Create a new folder to organize your bookmarks."
                : "Update the folder details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work Resources"
                autoFocus
              />
              {error.name && <p className="text-destructive text-sm">{error.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this folder for?"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Parent Folder (Optional)</Label>
              <Select
                value={parentId || ""}
                onValueChange={(value) => setParentId(value === "" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent folder (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent (Root level)</SelectItem>
                  {folderList.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {Array(folder.level).fill("—").join("")} {folder.level > 0 ? " " : ""}{folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {mode === "create" ? "Create Folder" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
