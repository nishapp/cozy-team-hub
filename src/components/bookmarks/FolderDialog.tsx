
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

interface FolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; description?: string; parentId?: string | null }) => void;
  initialValues?: { name: string; description?: string; parentId?: string | null };
  mode?: "create" | "edit";
  parentFolders: BookmarkFolder[];
  currentParentId: string | null;
}

export const FolderDialog: React.FC<FolderDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValues,
  mode = "create",
  parentFolders,
  currentParentId,
}) => {
  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [parentId, setParentId] = useState<string | null>(initialValues?.parentId !== undefined ? initialValues.parentId : currentParentId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialValues?.name || "");
      setDescription(initialValues?.description || "");
      setParentId(initialValues?.parentId !== undefined ? initialValues.parentId : currentParentId);
      setError("");
    }
  }, [isOpen, initialValues, currentParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Folder name is required");
      return;
    }
    
    onConfirm({ 
      name: name.trim(), 
      description: description.trim() || undefined,
      parentId,
    });
  };

  // Build a map of folder hierarchy to prevent circular references
  const getFolderHierarchy = (folderId: string | null): Set<string> => {
    const result = new Set<string>();
    if (folderId) {
      result.add(folderId);
      const folder = parentFolders.find(f => f.id === folderId);
      if (folder?.parentId) {
        const parentHierarchy = getFolderHierarchy(folder.parentId);
        parentHierarchy.forEach(id => result.add(id));
      }
    }
    return result;
  };

  const invalidParentIds = mode === "edit" && initialValues?.parentId 
    ? getFolderHierarchy(initialValues.parentId) 
    : new Set<string>();

  // Get flattened folder list for select element, including hierarchy info
  const getFolderOptions = () => {
    const result: { id: string | null; name: string; level: number }[] = [
      { id: null, name: "None (Root Level)", level: 0 }
    ];

    const addFoldersRecursive = (parentId: string | null, level: number) => {
      const folders = parentFolders
        .filter(f => f.parentId === parentId)
        .filter(f => mode !== "edit" || !invalidParentIds.has(f.id));
      
      folders.forEach(folder => {
        result.push({
          id: folder.id,
          name: folder.name,
          level,
        });
        addFoldersRecursive(folder.id, level + 1);
      });
    };

    addFoldersRecursive(null, 0);
    return result;
  };

  const folderOptions = getFolderOptions();

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
                ? "Add a new folder to organize your bookmarks."
                : "Update folder details and organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Folder Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work Resources"
                autoFocus
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
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
              <Label htmlFor="parent">Parent Folder</Label>
              <Select
                value={parentId || "null"}
                onValueChange={(value) => setParentId(value === "null" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  {folderOptions.map((option) => (
                    <SelectItem 
                      key={option.id || "root"} 
                      value={option.id || "null"}
                      disabled={mode === "edit" && invalidParentIds.has(option.id || "")}
                    >
                      {option.level > 0 && "—".repeat(option.level) + " "}
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
