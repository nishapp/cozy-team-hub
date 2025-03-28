
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
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookmarkFolder } from "@/types/bookmark";

interface FolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate: boolean;
  }) => void;
  parentFolders: BookmarkFolder[];
  currentParentId: string | null;
  initialValues?: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate?: boolean;
  };
  mode?: "create" | "edit";
}

export const FolderDialog: React.FC<FolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  parentFolders,
  currentParentId,
  initialValues,
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
    
    if (!name.trim()) {
      setError({ name: "Folder name is required" });
      return;
    }
    
    onConfirm({ 
      name: name.trim(), 
      description: description.trim() || undefined,
      parentId,
      isPrivate,
    });
  };

  // Build folder path map for showing full paths in the select
  const buildFolderPaths = (folders: BookmarkFolder[], parentMap: Map<string, string> = new Map()): Map<string, string> => {
    for (const folder of folders) {
      let path = folder.name;
      
      let currentParent = folder.parentId;
      while (currentParent && parentMap.has(currentParent)) {
        path = `${parentMap.get(currentParent)} / ${path}`;
        currentParent = folders.find(f => f.id === currentParent)?.parentId || null;
      }
      
      parentMap.set(folder.id, path);
    }
    
    return parentMap;
  };
  
  const folderPaths = buildFolderPaths(parentFolders);

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
                placeholder="e.g., Development Resources"
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
                placeholder="What kind of bookmarks will be in this folder?"
                rows={3}
              />
            </div>
            {parentFolders.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="parent">Parent Folder (Optional)</Label>
                <Select
                  value={parentId || ""}
                  onValueChange={(value) => setParentId(value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No parent (root folder)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No parent (root folder)</SelectItem>
                    {parentFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folderPaths.get(folder.id) || folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label htmlFor="privacy" className="flex items-center space-x-2 cursor-pointer">
                  {isPrivate ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-label="Private" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-label="Public" />
                  )}
                  <span>{isPrivate ? "Private" : "Public"}</span>
                </Label>
              </div>
              <Switch
                id="privacy"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
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
