
import React, { useState } from "react";
import { 
  FolderIcon, 
  PlusCircle, 
  Link as LinkIcon, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Search,
  ChevronRight
} from "lucide-react";
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";
import { FolderDialog } from "./FolderDialog";
import { BookmarkDialog } from "./BookmarkDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BookmarksContentProps {
  folders: BookmarkFolder[];
  bookmarks: BookmarkItem[];
  breadcrumbs: { id: string; name: string }[];
  currentFolder: BookmarkFolder | null;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  updateBookmarksData: (data: {
    folders: BookmarkFolder[];
    rootBookmarks: BookmarkItem[];
  }) => void;
  allFolders: BookmarkFolder[];
  rootBookmarks: BookmarkItem[];
}

export const BookmarksContent = ({
  folders,
  bookmarks,
  breadcrumbs,
  currentFolder,
  selectedFolderId,
  onSelectFolder,
  updateBookmarksData,
  allFolders,
  rootBookmarks,
}: BookmarksContentProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateBookmarkOpen, setIsCreateBookmarkOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isDeleteBookmarkOpen, setIsDeleteBookmarkOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<BookmarkFolder | null>(null);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<BookmarkItem | null>(null);
  
  // Filter items based on search query
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create folder handlers
  const handleCreateFolder = (folder: { name: string; description?: string; parentId?: string | null }) => {
    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: folder.name,
      description: folder.description,
      parentId: selectedFolderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: [],
    };

    updateBookmarksData({
      folders: [...allFolders, newFolder],
      rootBookmarks,
    });

    setIsCreateFolderOpen(false);
    toast.success("Folder created successfully");
  };

  // Create bookmark handlers
  const handleCreateBookmark = (bookmark: { 
    title: string; 
    url: string; 
    description?: string;
  }) => {
    const newBookmark: BookmarkItem = {
      id: `bookmark-${Date.now()}`,
      title: bookmark.title,
      url: validateUrl(bookmark.url),
      description: bookmark.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (selectedFolderId) {
      // Update a bookmark in a folder
      const updatedFolders = allFolders.map(folder => {
        if (folder.id === selectedFolderId) {
          return {
            ...folder,
            bookmarks: [...folder.bookmarks, newBookmark],
            updatedAt: new Date().toISOString(),
          };
        }
        return folder;
      });

      updateBookmarksData({
        folders: updatedFolders,
        rootBookmarks,
      });
    } else {
      // Add to root bookmarks
      updateBookmarksData({
        folders: allFolders,
        rootBookmarks: [...rootBookmarks, newBookmark],
      });
    }

    setIsCreateBookmarkOpen(false);
    toast.success("Bookmark added successfully");
  };

  // Edit folder handlers
  const handleEditFolder = (folder: { name: string; description?: string; parentId?: string | null }) => {
    if (!folderToEdit) return;

    const updatedFolders = allFolders.map(f => {
      if (f.id === folderToEdit.id) {
        return {
          ...f,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          updatedAt: new Date().toISOString(),
        };
      }
      return f;
    });

    updateBookmarksData({
      folders: updatedFolders,
      rootBookmarks,
    });

    setIsEditFolderOpen(false);
    setFolderToEdit(null);
    toast.success("Folder updated successfully");
  };

  // Edit bookmark handlers
  const handleEditBookmark = (bookmark: { 
    title: string; 
    url: string; 
    description?: string;
  }) => {
    if (!bookmarkToEdit) return;

    if (selectedFolderId) {
      // Update a bookmark in a folder
      const updatedFolders = allFolders.map(folder => {
        if (folder.id === selectedFolderId) {
          const updatedBookmarks = folder.bookmarks.map(b => {
            if (b.id === bookmarkToEdit.id) {
              return {
                ...b,
                title: bookmark.title,
                url: validateUrl(bookmark.url),
                description: bookmark.description,
                updatedAt: new Date().toISOString(),
              };
            }
            return b;
          });

          return {
            ...folder,
            bookmarks: updatedBookmarks,
            updatedAt: new Date().toISOString(),
          };
        }
        return folder;
      });

      updateBookmarksData({
        folders: updatedFolders,
        rootBookmarks,
      });
    } else {
      // Update a root bookmark
      const updatedRootBookmarks = rootBookmarks.map(b => {
        if (b.id === bookmarkToEdit.id) {
          return {
            ...b,
            title: bookmark.title,
            url: validateUrl(bookmark.url),
            description: bookmark.description,
            updatedAt: new Date().toISOString(),
          };
        }
        return b;
      });

      updateBookmarksData({
        folders: allFolders,
        rootBookmarks: updatedRootBookmarks,
      });
    }

    setIsEditBookmarkOpen(false);
    setBookmarkToEdit(null);
    toast.success("Bookmark updated successfully");
  };

  // Delete folder handler
  const handleDeleteFolder = () => {
    if (!folderToEdit) return;

    const foldersToDelete = [folderToEdit.id];
    
    // Recursively find all child folders
    const findChildFolders = (parentId: string) => {
      const children = allFolders.filter(f => f.parentId === parentId);
      children.forEach(child => {
        foldersToDelete.push(child.id);
        findChildFolders(child.id);
      });
    };
    
    findChildFolders(folderToEdit.id);
    
    const updatedFolders = allFolders.filter(f => !foldersToDelete.includes(f.id));

    updateBookmarksData({
      folders: updatedFolders,
      rootBookmarks,
    });

    // If we're deleting the currently selected folder, navigate to parent or root
    if (selectedFolderId === folderToEdit.id) {
      onSelectFolder(folderToEdit.parentId || null);
    }

    setIsDeleteFolderOpen(false);
    setFolderToEdit(null);
    toast.success("Folder deleted successfully");
  };

  // Delete bookmark handler
  const handleDeleteBookmark = () => {
    if (!bookmarkToEdit) return;

    if (selectedFolderId) {
      // Delete from folder
      const updatedFolders = allFolders.map(folder => {
        if (folder.id === selectedFolderId) {
          return {
            ...folder,
            bookmarks: folder.bookmarks.filter(b => b.id !== bookmarkToEdit.id),
            updatedAt: new Date().toISOString(),
          };
        }
        return folder;
      });

      updateBookmarksData({
        folders: updatedFolders,
        rootBookmarks,
      });
    } else {
      // Delete from root
      const updatedRootBookmarks = rootBookmarks.filter(b => b.id !== bookmarkToEdit.id);

      updateBookmarksData({
        folders: allFolders,
        rootBookmarks: updatedRootBookmarks,
      });
    }

    setIsDeleteBookmarkOpen(false);
    setBookmarkToEdit(null);
    toast.success("Bookmark deleted successfully");
  };

  // URL validation helper
  const validateUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentFolder ? currentFolder.name : "All Bookmarks"}
            </h1>
            {currentFolder?.description && (
              <p className="text-muted-foreground mt-1">{currentFolder.description}</p>
            )}
            
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <button
                  onClick={() => onSelectFolder(null)}
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </button>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight className="h-4 w-4 mx-1" />
                    <button
                      onClick={() => onSelectFolder(i === breadcrumbs.length - 1 ? crumb.id : crumb.id)}
                      className={cn(
                        "hover:text-foreground transition-colors",
                        i === breadcrumbs.length - 1 ? "font-medium text-foreground" : ""
                      )}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
            >
              <FolderIcon className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button
              onClick={() => setIsCreateBookmarkOpen(true)}
              size="sm"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Add Bookmark
            </Button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Folders */}
        {filteredFolders.length > 0 && (
          <>
            {filteredFolders.map((folder) => (
              <Card key={folder.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div 
                    className="flex items-center cursor-pointer flex-1"
                    onClick={() => onSelectFolder(folder.id)}
                  >
                    <FolderIcon className="h-5 w-5 mr-2 text-amber-500" />
                    <CardTitle className="text-base">{folder.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setFolderToEdit(folder);
                          setIsEditFolderOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setFolderToEdit(folder);
                          setIsDeleteFolderOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  {folder.description ? (
                    <CardDescription className="line-clamp-2">
                      {folder.description}
                    </CardDescription>
                  ) : (
                    <CardDescription className="text-muted-foreground italic">
                      No description
                    </CardDescription>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  {folder.bookmarks.length} bookmark{folder.bookmarks.length !== 1 && 's'}
                </CardFooter>
              </Card>
            ))}
          </>
        )}
        
        {/* Bookmarks */}
        {filteredBookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center flex-1">
                <div className="h-5 w-5 mr-2 flex-shrink-0">
                  {bookmark.icon ? (
                    <>
                      <img
                        src={bookmark.icon}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling!.style.display = 'block';
                        }}
                      />
                      <LinkIcon className="h-full w-full text-blue-500 hidden" />
                    </>
                  ) : (
                    <LinkIcon className="h-full w-full text-blue-500" />
                  )}
                </div>
                <CardTitle className="text-base truncate">
                  {bookmark.title}
                </CardTitle>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  asChild
                >
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open link</span>
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setBookmarkToEdit(bookmark);
                        setIsEditBookmarkOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit Bookmark
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setBookmarkToEdit(bookmark);
                        setIsDeleteBookmarkOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Bookmark
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2">
                {bookmark.description || (
                  <span className="text-muted-foreground italic">
                    No description
                  </span>
                )}
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2 truncate">
                {bookmark.url}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Empty state */}
        {filteredFolders.length === 0 && filteredBookmarks.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No results found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search terms
                </p>
              </>
            ) : (
              <>
                <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                <p className="text-muted-foreground mt-2">
                  Add your first bookmark to get started
                </p>
                <div className="mt-4 space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateFolderOpen(true)}
                  >
                    <FolderIcon className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                  <Button onClick={() => setIsCreateBookmarkOpen(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <FolderDialog
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onConfirm={handleCreateFolder}
        parentFolders={allFolders}
        currentParentId={selectedFolderId}
      />

      <FolderDialog
        isOpen={isEditFolderOpen}
        onClose={() => {
          setIsEditFolderOpen(false);
          setFolderToEdit(null);
        }}
        onConfirm={handleEditFolder}
        parentFolders={allFolders.filter(f => f.id !== folderToEdit?.id)}
        currentParentId={folderToEdit?.parentId || null}
        initialValues={folderToEdit ? {
          name: folderToEdit.name,
          description: folderToEdit.description,
          parentId: folderToEdit.parentId,
        } : undefined}
        mode="edit"
      />

      <BookmarkDialog 
        isOpen={isCreateBookmarkOpen}
        onClose={() => setIsCreateBookmarkOpen(false)}
        onConfirm={handleCreateBookmark}
      />

      <BookmarkDialog
        isOpen={isEditBookmarkOpen}
        onClose={() => {
          setIsEditBookmarkOpen(false);
          setBookmarkToEdit(null);
        }}
        onConfirm={handleEditBookmark}
        initialValues={bookmarkToEdit ? {
          title: bookmarkToEdit.title,
          url: bookmarkToEdit.url,
          description: bookmarkToEdit.description,
        } : undefined}
        mode="edit"
      />
      
      <ConfirmDialog
        isOpen={isDeleteFolderOpen}
        onClose={() => {
          setIsDeleteFolderOpen(false);
          setFolderToEdit(null);
        }}
        onConfirm={handleDeleteFolder}
        title="Delete Folder"
        description={
          folderToEdit ? 
          `Are you sure you want to delete "${folderToEdit.name}" and all of its contents? This action cannot be undone.` :
          "Are you sure you want to delete this folder and all of its contents? This action cannot be undone."
        }
      />

      <ConfirmDialog 
        isOpen={isDeleteBookmarkOpen}
        onClose={() => {
          setIsDeleteBookmarkOpen(false);
          setBookmarkToEdit(null);
        }}
        onConfirm={handleDeleteBookmark}
        title="Delete Bookmark"
        description={
          bookmarkToEdit ?
          `Are you sure you want to delete "${bookmarkToEdit.title}"? This action cannot be undone.` :
          "Are you sure you want to delete this bookmark? This action cannot be undone."
        }
      />
    </div>
  );
};
