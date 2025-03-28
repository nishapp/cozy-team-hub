import React, { useState } from "react";
import { 
  FolderIcon, 
  PlusCircle, 
  Link as LinkIcon, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Search,
  ChevronRight,
  LayoutGrid,
  LayoutList,
  FileCode,
  Eye,
  EyeOff
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
import BitForm from "@/components/bits/BitForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BookmarkDetailModal from "@/components/bookmarks/BookmarkDetailModal";

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

export function BookmarksContent({
  folders,
  bookmarks,
  breadcrumbs,
  currentFolder,
  selectedFolderId,
  onSelectFolder,
  updateBookmarksData,
  allFolders,
  rootBookmarks,
}: BookmarksContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isCreateBookmarkOpen, setIsCreateBookmarkOpen] = useState(false);
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
  const [isDeleteFolderOpen, setIsDeleteFolderOpen] = useState(false);
  const [isDeleteBookmarkOpen, setIsDeleteBookmarkOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<BookmarkFolder | null>(null);
  const [bookmarkToEdit, setBookmarkToEdit] = useState<BookmarkItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isCreateBitOpen, setIsCreateBitOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredBookmarks = bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookmarkClick = (bookmark: BookmarkItem) => {
    setSelectedBookmark(bookmark);
    setIsDetailModalOpen(true);
  };

  const handleCreateFolder = (folder: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate: boolean;
  }) => {
    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: folder.name,
      description: folder.description,
      parentId: selectedFolderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: [],
      isPrivate: folder.isPrivate,
    };

    updateBookmarksData({
      folders: [...allFolders, newFolder],
      rootBookmarks,
    });

    setIsCreateFolderOpen(false);
    toast.success("Folder created successfully");
  };

  const handleCreateBookmark = (bookmark: { 
    title: string; 
    url: string; 
    description?: string;
    isPrivate: boolean;
  }) => {
    const newBookmark: BookmarkItem = {
      id: `bookmark-${Date.now()}`,
      title: bookmark.title,
      url: validateUrl(bookmark.url),
      description: bookmark.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: bookmark.isPrivate,
    };

    if (selectedFolderId) {
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
      updateBookmarksData({
        folders: allFolders,
        rootBookmarks: [...rootBookmarks, newBookmark],
      });
    }

    setIsCreateBookmarkOpen(false);
    toast.success("Bookmark added successfully");
  };

  const handleEditFolder = (folder: { 
    name: string; 
    description?: string; 
    parentId?: string | null;
    isPrivate: boolean;
  }) => {
    if (!folderToEdit) return;

    const updatedFolders = allFolders.map(f => {
      if (f.id === folderToEdit.id) {
        return {
          ...f,
          name: folder.name,
          description: folder.description,
          parentId: folder.parentId,
          isPrivate: folder.isPrivate,
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

  const handleEditBookmark = (bookmark: { 
    title: string; 
    url: string; 
    description?: string;
    isPrivate: boolean;
  }) => {
    if (!bookmarkToEdit) return;

    if (selectedFolderId) {
      const updatedFolders = allFolders.map(folder => {
        if (folder.id === selectedFolderId) {
          const updatedBookmarks = folder.bookmarks.map(b => {
            if (b.id === bookmarkToEdit.id) {
              return {
                ...b,
                title: bookmark.title,
                url: validateUrl(bookmark.url),
                description: bookmark.description,
                isPrivate: bookmark.isPrivate,
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
      const updatedRootBookmarks = rootBookmarks.map(b => {
        if (b.id === bookmarkToEdit.id) {
          return {
            ...b,
            title: bookmark.title,
            url: validateUrl(bookmark.url),
            description: bookmark.description,
            isPrivate: bookmark.isPrivate,
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

  const handleDeleteFolder = () => {
    if (!folderToEdit) return;

    const foldersToDelete = [folderToEdit.id];
    
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

    if (selectedFolderId === folderToEdit.id) {
      onSelectFolder(folderToEdit.parentId || null);
    }

    setIsDeleteFolderOpen(false);
    setFolderToEdit(null);
    toast.success("Folder deleted successfully");
  };

  const handleDeleteBookmark = () => {
    if (!bookmarkToEdit) return;

    if (selectedFolderId) {
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

  const validateUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const handleCreateBit = (bookmark: BookmarkItem) => {
    setSelectedBookmark(bookmark);
    setIsCreateBitOpen(true);
  };

  const handleBitSubmit = (bitData: any) => {
    toast.success("Bit created successfully from bookmark!");
    setIsCreateBitOpen(false);
    setSelectedBookmark(null);
  };

  const getInitialBitData = () => {
    if (!selectedBookmark) return {};
    
    return {
      title: selectedBookmark.title,
      description: selectedBookmark.description || "",
      link: selectedBookmark.url,
      tags: [],
      category: "bookmarks",
      visibility: "public",
    };
  };

  const handleSaveSummary = (bookmarkId: string, summary: string) => {
    let updatedBookmark: BookmarkItem | null = null;
    let updatedFolders: BookmarkFolder[] = [...allFolders];
    let updatedRootBookmarks: BookmarkItem[] = [...rootBookmarks];
    
    if (selectedFolderId) {
      const folderIndex = updatedFolders.findIndex(f => f.id === selectedFolderId);
      if (folderIndex !== -1) {
        const bookmarkIndex = updatedFolders[folderIndex].bookmarks.findIndex(b => b.id === bookmarkId);
        if (bookmarkIndex !== -1) {
          updatedBookmark = {
            ...updatedFolders[folderIndex].bookmarks[bookmarkIndex],
            summary,
            updatedAt: new Date().toISOString()
          };
          
          updatedFolders[folderIndex] = {
            ...updatedFolders[folderIndex],
            bookmarks: [
              ...updatedFolders[folderIndex].bookmarks.slice(0, bookmarkIndex),
              updatedBookmark,
              ...updatedFolders[folderIndex].bookmarks.slice(bookmarkIndex + 1)
            ]
          };
        }
      }
    } else {
      const bookmarkIndex = updatedRootBookmarks.findIndex(b => b.id === bookmarkId);
      if (bookmarkIndex !== -1) {
        updatedBookmark = {
          ...updatedRootBookmarks[bookmarkIndex],
          summary,
          updatedAt: new Date().toISOString()
        };
        
        updatedRootBookmarks = [
          ...updatedRootBookmarks.slice(0, bookmarkIndex),
          updatedBookmark,
          ...updatedRootBookmarks.slice(bookmarkIndex + 1)
        ];
      }
    }
    
    if (!updatedBookmark) {
      outerLoop: for (let i = 0; i < updatedFolders.length; i++) {
        const bookmarkIndex = updatedFolders[i].bookmarks.findIndex(b => b.id === bookmarkId);
        if (bookmarkIndex !== -1) {
          updatedBookmark = {
            ...updatedFolders[i].bookmarks[bookmarkIndex],
            summary,
            updatedAt: new Date().toISOString()
          };
          
          updatedFolders[i] = {
            ...updatedFolders[i],
            bookmarks: [
              ...updatedFolders[i].bookmarks.slice(0, bookmarkIndex),
              updatedBookmark,
              ...updatedFolders[i].bookmarks.slice(bookmarkIndex + 1)
            ]
          };
          
          break outerLoop;
        }
      }
    }
    
    if (updatedBookmark) {
      updateBookmarksData({
        folders: updatedFolders,
        rootBookmarks: updatedRootBookmarks
      });
      
      if (selectedBookmark && selectedBookmark.id === bookmarkId) {
        setSelectedBookmark(updatedBookmark);
      }
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {currentFolder ? currentFolder.name : "All Bookmarks"}
            </h1>
            {currentFolder?.description && (
              <p className="text-muted-foreground mt-1">{currentFolder.description}</p>
            )}
            
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
            <div className="flex bg-muted rounded-md p-1 mr-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
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
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          {filteredFolders.length > 0 && filteredFolders.map((folder) => (
            <Card key={folder.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                <div 
                  className="flex items-center cursor-pointer flex-1"
                  onClick={() => onSelectFolder(folder.id)}
                >
                  <FolderIcon className="h-5 w-5 mr-2 text-amber-500" />
                  <CardTitle className="text-base">{folder.name}</CardTitle>
                </div>
                <div className="flex items-center">
                  {folder.isPrivate ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground mr-2" aria-label="Private" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground mr-2" aria-label="Public" />
                  )}
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
                </div>
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
          
          {filteredBookmarks.map((bookmark) => (
            <Card 
              key={bookmark.id} 
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleBookmarkClick(bookmark)}
            >
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
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.display = 'none';
                            const nextElement = imgElement.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = 'block';
                            }
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
                <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
                  {bookmark.isPrivate ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-label="Private" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-label="Public" />
                  )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateBit(bookmark);
                    }}
                    title="Create Bit from Bookmark"
                  >
                    <FileCode className="h-4 w-4" />
                    <span className="sr-only">Create Bit</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookmarkToEdit(bookmark);
                          setIsEditBookmarkOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Bookmark
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateBit(bookmark);
                        }}
                      >
                        <FileCode className="h-4 w-4 mr-2" />
                        Create Bit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
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
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFolders.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Folders</h2>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm hidden md:table-cell">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm hidden lg:table-cell">Items</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm w-24">Privacy</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-sm w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredFolders.map((folder) => (
                      <tr key={folder.id} className="bg-card hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div 
                            className="flex items-center cursor-pointer"
                            onClick={() => onSelectFolder(folder.id)}
                          >
                            <FolderIcon className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
                            <span className="font-medium truncate">{folder.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm hidden md:table-cell">
                          {folder.description ? (
                            <span className="truncate block max-w-md">{folder.description}</span>
                          ) : (
                            <span className="italic">No description</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm hidden lg:table-cell">
                          {folder.bookmarks.length} bookmark{folder.bookmarks.length !== 1 && 's'}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          <div className="flex items-center">
                            {folder.isPrivate ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" aria-label="Private" />
                                <span>Private</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" aria-label="Public" />
                                <span>Public</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setFolderToEdit(folder);
                                setIsEditFolderOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setFolderToEdit(folder);
                                setIsDeleteFolderOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {filteredBookmarks.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-2">Bookmarks</h2>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm">Title</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm hidden md:table-cell">URL</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm hidden lg:table-cell">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-sm w-24">Privacy</th>
                      <th className="text-right p-3 font-medium text-muted-foreground text-sm w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredBookmarks.map((bookmark) => (
                      <tr 
                        key={bookmark.id} 
                        className="bg-card hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleBookmarkClick(bookmark)}
                      >
                        <td className="p-3">
                          <div className="flex items-center">
                            <div className="h-4 w-4 mr-2 flex-shrink-0">
                              {bookmark.icon ? (
                                <>
                                  <img
                                    src={bookmark.icon}
                                    alt=""
                                    className="h-full w-full object-contain"
                                    onError={(e) => {
                                      const imgElement = e.target as HTMLImageElement;
                                      imgElement.style.display = 'none';
                                      const nextElement = imgElement.nextElementSibling as HTMLElement;
                                      if (nextElement) {
                                        nextElement.style.display = 'block';
                                      }
                                    }}
                                  />
                                  <LinkIcon className="h-full w-full text-blue-500 hidden" />
                                </>
                              ) : (
                                <LinkIcon className="h-full w-full text-blue-500" />
                              )}
                            </div>
                            <span className="font-medium truncate">{bookmark.title}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm hidden md:table-cell">
                          <span className="truncate block max-w-xs">{bookmark.url}</span>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm hidden lg:table-cell">
                          {bookmark.description ? (
                            <span className="truncate block max-w-md">{bookmark.description}</span>
                          ) : (
                            <span className="italic">No description</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          <div className="flex items-center">
                            {bookmark.isPrivate ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" aria-label="Private" />
                                <span>Private</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" aria-label="Public" />
                                <span>Public</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end space-x-1">
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
                                <span className="sr-only">Open</span>
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateBit(bookmark);
                              }}
                              title="Create Bit from Bookmark"
                            >
                              <FileCode className="h-4 w-4" />
                              <span className="sr-only">Create Bit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookmarkToEdit(bookmark);
                                setIsEditBookmarkOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookmarkToEdit(bookmark);
                                setIsDeleteBookmarkOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {filteredFolders.length === 0 && filteredBookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
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
          isPrivate: folderToEdit.isPrivate,
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
          isPrivate: bookmarkToEdit.isPrivate,
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

      <Dialog open={isCreateBitOpen} onOpenChange={setIsCreateBitOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Bit from Bookmark</DialogTitle>
            <DialogDescription>
              Use this bookmark to create a new bit. You can customize the details below.
            </DialogDescription>
          </DialogHeader>
          
          <BitForm 
            onSubmit={handleBitSubmit} 
            onCancel={() => setIsCreateBitOpen(false)} 
            initialData={getInitialBitData()}
          />
        </DialogContent>
      </Dialog>

      <BookmarkDetailModal
        bookmark={selectedBookmark}
        isOpen={!!selectedBookmark}
        onClose={() => setSelectedBookmark(null)}
        onEdit={handleEditBookmark}
        onSaveSummary={handleSaveSummary}
      />
    </div>
  );
}
