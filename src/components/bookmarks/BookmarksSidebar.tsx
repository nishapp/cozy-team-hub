
import React, { useState } from "react";
import { 
  FolderIcon, 
  ChevronDown, 
  ChevronRight,
  PlusCircle,
  Bookmark,
  HardDrive
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";
import { FolderDialog } from "./FolderDialog";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface BookmarksSidebarProps {
  folders: BookmarkFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  updateBookmarksData: (data: {
    folders: BookmarkFolder[];
    rootBookmarks: BookmarkItem[];
  }) => void;
}

export const BookmarksSidebar = ({
  folders,
  selectedFolderId,
  onSelectFolder,
  updateBookmarksData,
}: BookmarksSidebarProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Toggle folder expansion
  const toggleFolderExpansion = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  // Handle adding a new folder
  const handleAddFolder = (folder: { name: string; description?: string; parentId?: string | null }) => {
    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: folder.name,
      description: folder.description,
      parentId: folder.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: [],
    };

    updateBookmarksData({
      folders: [...folders, newFolder],
      rootBookmarks: [] // This will be filled in by the parent component
    });

    setIsCreateDialogOpen(false);
  };

  // Recursive function to render folder tree
  const renderFolders = (parentId: string | null = null, depth = 0) => {
    const foldersToRender = folders.filter(f => f.parentId === parentId);
    
    return foldersToRender.map(folder => {
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const isExpanded = expandedFolders[folder.id];
      const isSelected = selectedFolderId === folder.id;
      
      return (
        <div key={folder.id}>
          <div 
            className={cn(
              "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
              isSelected ? "bg-accent text-accent-foreground" : "text-foreground"
            )}
            style={{ paddingLeft: `${(depth * 10) + 8}px` }}
            onClick={() => onSelectFolder(folder.id)}
          >
            {hasChildren ? (
              <button
                onClick={(e) => toggleFolderExpansion(folder.id, e)}
                className="p-1 mr-1 rounded-md hover:bg-muted"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{folder.name}</span>
            {folder.bookmarks.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {folder.bookmarks.length}
              </span>
            )}
          </div>
          
          {isExpanded && hasChildren && (
            <div className="pl-4">
              {renderFolders(folder.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Sidebar variant="sidebar" className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-between items-center">
            <span>Bookmarks</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={selectedFolderId === null}
                  onClick={() => onSelectFolder(null)}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  <span>All Bookmarks</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-2 space-y-1">
              {renderFolders()}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          <span>New Folder</span>
        </Button>
      </SidebarFooter>

      <FolderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={handleAddFolder}
        parentFolders={folders}
        currentParentId={selectedFolderId}
      />
    </Sidebar>
  );
};
