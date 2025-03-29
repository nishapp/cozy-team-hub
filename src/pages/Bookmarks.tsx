
import React, { useState, useEffect, useCallback } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, Folder, FolderPlus, Globe, BookmarkIcon, Grid2X2, LayoutList, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { isDemoMode } from "@/lib/supabase";

// Types
type BookmarkViewMode = "grid" | "list";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  thumbnail_url?: string;
  folder_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  order: number;
  bit_id?: string;
  source?: "personal" | "bit" | "friend_bit";
}

interface BookmarkFolder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  order: number;
  children?: BookmarkFolder[];
}

// Local Storage Keys
const STORAGE_KEYS = {
  FOLDERS: 'bookmark_folders',
  BOOKMARKS: 'bookmarks',
  ACTIVE_FOLDER: 'active_bookmark_folder',
  VIEW_MODE: 'bookmark_view_mode'
};

// Client-side mock data function
const createInitialData = (userId: string) => {
  const rootFolder: BookmarkFolder = {
    id: "root",
    name: "Bookmarks",
    parent_id: null,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 0
  };

  const bitsFolder: BookmarkFolder = {
    id: "bits-folder",
    name: "My Bits",
    parent_id: "root",
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 1
  };

  const friendsFolder: BookmarkFolder = {
    id: "friends-folder",
    name: "Friends' Bits",
    parent_id: "root",
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 2
  };

  const workFolder: BookmarkFolder = {
    id: "work-folder",
    name: "Work",
    parent_id: "root",
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 3
  };

  const personalFolder: BookmarkFolder = {
    id: "personal-folder",
    name: "Personal",
    parent_id: "root",
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 4
  };

  // Nested folders
  const devFolder: BookmarkFolder = {
    id: "dev-folder",
    name: "Development",
    parent_id: "work-folder",
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    order: 0
  };

  const folders = [rootFolder, bitsFolder, friendsFolder, workFolder, personalFolder, devFolder];

  // Sample bookmarks
  const bookmarks: Bookmark[] = [
    {
      id: uuidv4(),
      title: "GitHub",
      url: "https://github.com",
      description: "Where the world builds software",
      thumbnail_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
      folder_id: devFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 0,
      source: "personal"
    },
    {
      id: uuidv4(),
      title: "Stack Overflow",
      url: "https://stackoverflow.com",
      description: "Where developers learn, share, & build careers",
      thumbnail_url: "https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png",
      folder_id: devFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 1,
      source: "personal"
    },
    {
      id: uuidv4(),
      title: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      description: "Resources for developers, by developers",
      thumbnail_url: "https://developer.mozilla.org/apple-touch-icon.6803c6f0.png",
      folder_id: devFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 2,
      source: "personal"
    },
    {
      id: uuidv4(),
      title: "Netflix",
      url: "https://netflix.com",
      description: "Watch TV shows and movies",
      thumbnail_url: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png",
      folder_id: personalFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 0,
      source: "personal"
    },
    {
      id: uuidv4(),
      title: "Spotify",
      url: "https://spotify.com",
      description: "Music for everyone",
      thumbnail_url: "https://www.scdn.co/i/_global/twitter_card-default.jpg",
      folder_id: personalFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 1,
      source: "personal"
    },
    {
      id: uuidv4(),
      title: "Learning React",
      url: "https://react.dev",
      description: "A bit about React",
      thumbnail_url: "https://react.dev/favicon.ico",
      folder_id: bitsFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 0,
      source: "bit",
      bit_id: "bit1"
    },
    {
      id: uuidv4(),
      title: "Friend's JavaScript Tips",
      url: "https://javascript.info",
      description: "Shared by a friend",
      thumbnail_url: "https://javascript.info/img/favicon/apple-touch-icon.png",
      folder_id: friendsFolder.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: 0,
      source: "friend_bit",
      bit_id: "bit2"
    }
  ];

  return { folders, bookmarks };
};

// Helper functions for localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Component for Sortable Bookmark Item
const BookmarkItem = ({ bookmark, viewMode, onEdit, onDelete, onMove }) => {
  if (viewMode === "grid") {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <Card className="bookmark-card hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {bookmark.thumbnail_url ? (
                  <div className="h-32 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={bookmark.thumbnail_url} 
                      alt={bookmark.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400x200/9ca3af/ffffff?text=No+Thumbnail";
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Globe className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="font-medium text-sm line-clamp-1 mb-1">{bookmark.title}</h3>
                  {bookmark.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{bookmark.description}</p>
                  )}
                  <div className="mt-auto flex items-center text-xs text-muted-foreground">
                    <Globe className="w-3 h-3 mr-1" /> 
                    <span className="truncate">{new URL(bookmark.url).hostname.replace('www.', '')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => window.open(bookmark.url, "_blank")}>Open Link</ContextMenuItem>
          <ContextMenuItem onClick={() => onEdit(bookmark)}>Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onMove(bookmark)}>Move</ContextMenuItem>
          <ContextMenuItem className="text-destructive" onClick={() => onDelete(bookmark.id)}>Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }
  
  // List view
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center p-2 hover:bg-accent rounded-md cursor-pointer transition-colors">
          <div className="flex-shrink-0 mr-3">
            {bookmark.thumbnail_url ? (
              <img 
                src={bookmark.thumbnail_url} 
                alt={bookmark.title} 
                className="w-6 h-6 rounded-sm object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/60x60/9ca3af/ffffff?text=●";
                }}
              />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-sm font-medium truncate">{bookmark.title}</h3>
            <p className="text-xs text-muted-foreground truncate">{new URL(bookmark.url).hostname.replace('www.', '')}</p>
          </div>
          <div className="flex-shrink-0 text-xs text-muted-foreground">
            {new Date(bookmark.created_at).toLocaleDateString()}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => window.open(bookmark.url, "_blank")}>Open Link</ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit(bookmark)}>Edit</ContextMenuItem>
        <ContextMenuItem onClick={() => onMove(bookmark)}>Move</ContextMenuItem>
        <ContextMenuItem className="text-destructive" onClick={() => onDelete(bookmark.id)}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Component for Folder Tree Item
const FolderTreeItem = ({ folder, bookmarks, activeFolderId, onFolderClick, onAddBookmark, onAddFolder, viewMode, onEditBookmark, onDeleteBookmark, onMoveBookmark, allFolders }) => {
  const folderBookmarks = bookmarks.filter(b => b.folder_id === folder.id);
  const hasChildren = allFolders.some(f => f.parent_id === folder.id);
  
  const childFolders = allFolders
    .filter(f => f.parent_id === folder.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="folder-item">
      <div 
        className={`flex items-center p-2 rounded-md cursor-pointer ${activeFolderId === folder.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
        onClick={() => onFolderClick(folder.id)}
      >
        <Folder className={`mr-2 h-4 w-4 ${activeFolderId === folder.id ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="text-sm flex-grow truncate">{folder.name}</span>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            title="Add bookmark"
            onClick={(e) => {
              e.stopPropagation();
              onAddBookmark(folder.id);
            }}
          >
            <BookmarkIcon className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            title="Add subfolder"
            onClick={(e) => {
              e.stopPropagation();
              onAddFolder(folder.id);
            }}
          >
            <FolderPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {hasChildren && (
        <Collapsible defaultOpen className="ml-4 mt-1 border-l pl-2 border-border">
          <CollapsibleContent className="space-y-1">
            {childFolders.map(childFolder => (
              <FolderTreeItem
                key={childFolder.id}
                folder={childFolder}
                bookmarks={bookmarks}
                activeFolderId={activeFolderId}
                onFolderClick={onFolderClick}
                onAddBookmark={onAddBookmark}
                onAddFolder={onAddFolder}
                viewMode={viewMode}
                onEditBookmark={onEditBookmark}
                onDeleteBookmark={onDeleteBookmark}
                onMoveBookmark={onMoveBookmark}
                allFolders={allFolders}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

// Main Bookmarks Page
const BookmarksPage = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>("root");
  const [viewMode, setViewMode] = useState<BookmarkViewMode>("grid");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Modal states
  const [showAddBookmarkModal, setShowAddBookmarkModal] = useState<boolean>(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState<boolean>(false);
  const [showMoveBookmarkModal, setShowMoveBookmarkModal] = useState<boolean>(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [editBookmark, setEditBookmark] = useState<Bookmark | null>(null);
  const [moveBookmark, setMoveBookmark] = useState<Bookmark | null>(null);
  
  // Form states
  const [newBookmarkTitle, setNewBookmarkTitle] = useState<string>("");
  const [newBookmarkUrl, setNewBookmarkUrl] = useState<string>("");
  const [newBookmarkDescription, setNewBookmarkDescription] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");

  // Initialize data from localStorage or create new data if not exists
  useEffect(() => {
    if (user) {
      const storedFolders = getFromLocalStorage<BookmarkFolder[]>(STORAGE_KEYS.FOLDERS, []);
      const storedBookmarks = getFromLocalStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);
      const storedActiveFolderId = getFromLocalStorage<string>(STORAGE_KEYS.ACTIVE_FOLDER, "root");
      const storedViewMode = getFromLocalStorage<BookmarkViewMode>(STORAGE_KEYS.VIEW_MODE, "grid");

      // If there's no data in localStorage, create initial demo data
      if (storedFolders.length === 0 || (isDemoMode && storedFolders.length === 0)) {
        const { folders, bookmarks } = createInitialData(user.id);
        setFolders(folders);
        setBookmarks(bookmarks);
        saveToLocalStorage(STORAGE_KEYS.FOLDERS, folders);
        saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
      } else {
        setFolders(storedFolders);
        setBookmarks(storedBookmarks);
      }

      setActiveFolderId(storedActiveFolderId);
      setViewMode(storedViewMode);
      setIsLoading(false);
    }
  }, [user]);

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(STORAGE_KEYS.FOLDERS, folders);
      saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
      saveToLocalStorage(STORAGE_KEYS.ACTIVE_FOLDER, activeFolderId);
      saveToLocalStorage(STORAGE_KEYS.VIEW_MODE, viewMode);
    }
  }, [folders, bookmarks, activeFolderId, viewMode, isLoading]);

  // Get current folder bookmarks
  const getCurrentFolderBookmarks = useCallback(() => {
    return bookmarks.filter(b => b.folder_id === activeFolderId)
      .sort((a, b) => a.order - b.order);
  }, [bookmarks, activeFolderId]);

  // Get active folder
  const getActiveFolder = useCallback(() => {
    return folders.find(f => f.id === activeFolderId);
  }, [folders, activeFolderId]);

  // Handle adding new bookmark
  const handleAddBookmark = useCallback((folderId: string) => {
    setCurrentFolder(folderId);
    setEditBookmark(null);
    setNewBookmarkTitle("");
    setNewBookmarkUrl("");
    setNewBookmarkDescription("");
    setShowAddBookmarkModal(true);
  }, []);

  // Handle editing bookmark
  const handleEditBookmark = useCallback((bookmark: Bookmark) => {
    setEditBookmark(bookmark);
    setNewBookmarkTitle(bookmark.title);
    setNewBookmarkUrl(bookmark.url);
    setNewBookmarkDescription(bookmark.description || "");
    setShowAddBookmarkModal(true);
  }, []);

  // Handle moving bookmark
  const handleMoveBookmark = useCallback((bookmark: Bookmark) => {
    setMoveBookmark(bookmark);
    setSelectedFolderId(bookmark.folder_id);
    setShowMoveBookmarkModal(true);
  }, []);

  // Handle adding new folder
  const handleAddFolder = useCallback((parentId: string) => {
    setCurrentFolder(parentId);
    setNewFolderName("");
    setShowAddFolderModal(true);
  }, []);

  // Handle deleting bookmark
  const handleDeleteBookmark = useCallback((bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    toast.success("Bookmark deleted");
  }, []);

  // Save new bookmark
  const saveBookmark = useCallback(() => {
    if (!newBookmarkTitle || !newBookmarkUrl) {
      toast.error("Title and URL are required");
      return;
    }

    try {
      // Validate URL
      new URL(newBookmarkUrl);
      
      if (editBookmark) {
        // Update existing bookmark
        const updatedBookmarks = bookmarks.map(b => 
          b.id === editBookmark.id 
            ? { 
                ...b, 
                title: newBookmarkTitle, 
                url: newBookmarkUrl, 
                description: newBookmarkDescription,
                updated_at: new Date().toISOString()
              } 
            : b
        );
        setBookmarks(updatedBookmarks);
        saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, updatedBookmarks);
        toast.success("Bookmark updated");
      } else {
        // Add new bookmark
        const folderBookmarks = bookmarks.filter(b => b.folder_id === currentFolder);
        const newOrder = folderBookmarks.length > 0 
          ? Math.max(...folderBookmarks.map(b => b.order)) + 1 
          : 0;
        
        const newBookmark: Bookmark = {
          id: uuidv4(),
          title: newBookmarkTitle,
          url: newBookmarkUrl,
          description: newBookmarkDescription,
          folder_id: currentFolder || activeFolderId,
          user_id: user?.id || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          order: newOrder,
          source: "personal"
        };
        
        const updatedBookmarks = [...bookmarks, newBookmark];
        setBookmarks(updatedBookmarks);
        saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, updatedBookmarks);
        toast.success("Bookmark added");
      }
      
      setShowAddBookmarkModal(false);
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  }, [newBookmarkTitle, newBookmarkUrl, newBookmarkDescription, editBookmark, currentFolder, activeFolderId, bookmarks, user?.id]);

  // Save new folder
  const saveFolder = useCallback(() => {
    if (!newFolderName) {
      toast.error("Folder name is required");
      return;
    }
    
    const childFolders = folders.filter(f => f.parent_id === currentFolder);
    const newOrder = childFolders.length > 0 
      ? Math.max(...childFolders.map(f => f.order)) + 1 
      : 0;
    
    const newFolder: BookmarkFolder = {
      id: uuidv4(),
      name: newFolderName,
      parent_id: currentFolder,
      user_id: user?.id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order: newOrder
    };
    
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    saveToLocalStorage(STORAGE_KEYS.FOLDERS, updatedFolders);
    
    setShowAddFolderModal(false);
    toast.success("Folder created");
    
    console.log("New folder added:", newFolder);
    console.log("Updated folders list:", updatedFolders);
  }, [newFolderName, currentFolder, folders, user?.id]);

  // Move bookmark to another folder
  const moveBookmarkToFolder = useCallback(() => {
    if (!moveBookmark || !selectedFolderId) return;
    
    const folderBookmarks = bookmarks.filter(b => b.folder_id === selectedFolderId);
    const newOrder = folderBookmarks.length > 0 
      ? Math.max(...folderBookmarks.map(b => b.order)) + 1 
      : 0;
    
    const updatedBookmarks = bookmarks.map(b => 
      b.id === moveBookmark.id 
        ? { 
            ...b, 
            folder_id: selectedFolderId,
            order: newOrder,
            updated_at: new Date().toISOString()
          } 
        : b
    );
    
    setBookmarks(updatedBookmarks);
    saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, updatedBookmarks);
    
    setShowMoveBookmarkModal(false);
    toast.success("Bookmark moved");
  }, [moveBookmark, selectedFolderId, bookmarks]);

  // Handle drag and drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setBookmarks(prev => {
        const items = prev.filter(b => b.folder_id === activeFolderId);
        const oldIndex = items.findIndex(b => b.id === active.id);
        const newIndex = items.findIndex(b => b.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return prev;
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        
        // Update order values
        const updated = reordered.map((item, index) => ({
          ...item,
          order: index
        }));
        
        // Replace the bookmarks in the current folder with the updated ones
        const updatedBookmarks = prev.map(bookmark => {
          const updatedBookmark = updated.find(u => u.id === bookmark.id);
          return updatedBookmark || bookmark;
        });
        
        // Save to localStorage
        saveToLocalStorage(STORAGE_KEYS.BOOKMARKS, updatedBookmarks);
        
        return updatedBookmarks;
      });
    }
  }, [activeFolderId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const currentBookmarks = getCurrentFolderBookmarks();
  const activeFolder = getActiveFolder();

  return (
    <div className="page-container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bookmarks</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={viewMode === "grid" ? "bg-accent" : ""}
            onClick={() => setViewMode("grid")}
          >
            <Grid2X2 className="h-4 w-4 mr-1" />
            Grid
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={viewMode === "list" ? "bg-accent" : ""}
            onClick={() => setViewMode("list")}
          >
            <LayoutList className="h-4 w-4 mr-1" />
            List
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => handleAddBookmark(activeFolderId)}
          >
            <BookmarkIcon className="h-4 w-4 mr-1" />
            Add Bookmark
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar with folders */}
        <div className="col-span-12 md:col-span-3">
          <Card className="h-full">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Folders</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleAddFolder("root")}
                >
                  <FolderPlus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-1">
                  {folders
                    .filter(f => f.parent_id === null)
                    .sort((a, b) => a.order - b.order)
                    .map(folder => (
                      <FolderTreeItem
                        key={folder.id}
                        folder={folder}
                        bookmarks={bookmarks}
                        activeFolderId={activeFolderId}
                        onFolderClick={setActiveFolderId}
                        onAddBookmark={handleAddBookmark}
                        onAddFolder={handleAddFolder}
                        viewMode={viewMode}
                        onEditBookmark={handleEditBookmark}
                        onDeleteBookmark={handleDeleteBookmark}
                        onMoveBookmark={handleMoveBookmark}
                        allFolders={folders}
                      />
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main content with bookmarks */}
        <div className="col-span-12 md:col-span-9">
          <Card className="h-full">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">
                {activeFolder?.name || "All Bookmarks"}
                <span className="text-muted-foreground ml-2 text-sm">
                  ({currentBookmarks.length} bookmark{currentBookmarks.length !== 1 ? 's' : ''})
                </span>
              </h2>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={currentBookmarks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentBookmarks.map(bookmark => (
                        <BookmarkItem
                          key={bookmark.id}
                          bookmark={bookmark}
                          viewMode={viewMode}
                          onEdit={handleEditBookmark}
                          onDelete={handleDeleteBookmark}
                          onMove={handleMoveBookmark}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {currentBookmarks.map(bookmark => (
                        <BookmarkItem
                          key={bookmark.id}
                          bookmark={bookmark}
                          viewMode={viewMode}
                          onEdit={handleEditBookmark}
                          onDelete={handleDeleteBookmark}
                          onMove={handleMoveBookmark}
                        />
                      ))}
                    </div>
                  )}
                </SortableContext>
              </DndContext>

              {currentBookmarks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookmarkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No bookmarks yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first bookmark to this folder</p>
                  <Button onClick={() => handleAddBookmark(activeFolderId)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Bookmark Modal */}
      <Dialog open={showAddBookmarkModal} onOpenChange={setShowAddBookmarkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editBookmark ? "Edit Bookmark" : "Add New Bookmark"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                value={newBookmarkTitle}
                onChange={(e) => setNewBookmarkTitle(e.target.value)}
                placeholder="Bookmark title"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="url" className="text-sm font-medium">URL</label>
              <Input
                id="url"
                value={newBookmarkUrl}
                onChange={(e) => setNewBookmarkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
              <Input
                id="description"
                value={newBookmarkDescription}
                onChange={(e) => setNewBookmarkDescription(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBookmarkModal(false)}>Cancel</Button>
            <Button onClick={saveBookmark}>{editBookmark ? "Save Changes" : "Add Bookmark"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Folder Modal */}
      <Dialog open={showAddFolderModal} onOpenChange={setShowAddFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <label htmlFor="folderName" className="text-sm font-medium">Folder Name</label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFolderModal(false)}>Cancel</Button>
            <Button onClick={saveFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Bookmark Modal */}
      <Dialog open={showMoveBookmarkModal} onOpenChange={setShowMoveBookmarkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Bookmark</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <p className="text-sm">Select a folder to move "{moveBookmark?.title}" to:</p>
            
            <ScrollArea className="h-[300px]">
              <Accordion type="single" collapsible className="w-full">
                {folders
                  .filter(f => f.parent_id === null)
                  .sort((a, b) => a.order - b.order)
                  .map(folder => (
                    <FolderSelectItem
                      key={folder.id}
                      folder={folder}
                      allFolders={folders}
                      selectedFolderId={selectedFolderId}
                      onSelect={setSelectedFolderId}
                    />
                  ))}
              </Accordion>
            </ScrollArea>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveBookmarkModal(false)}>Cancel</Button>
            <Button onClick={moveBookmarkToFolder}>Move Bookmark</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Component for folder selection in the move modal
const FolderSelectItem = ({ folder, allFolders, selectedFolderId, onSelect }) => {
  const hasChildren = allFolders.some(f => f.parent_id === folder.id);
  
  const childFolders = allFolders
    .filter(f => f.parent_id === folder.id)
    .sort((a, b) => a.order - b.order);
  
  if (!hasChildren) {
    return (
      <div 
        className={`p-2 mb-1 rounded flex items-center cursor-pointer ${selectedFolderId === folder.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
        onClick={() => onSelect(folder.id)}
      >
        <Folder className="h-4 w-4 mr-2" />
        <span className="text-sm">{folder.name}</span>
      </div>
    );
  }
  
  return (
    <AccordionItem value={folder.id} className="border-0">
      <div className="flex">
        <div 
          className={`flex-grow p-2 flex items-center cursor-pointer ${selectedFolderId === folder.id ? 'bg-accent' : 'hover:bg-accent/50'} rounded-l`}
          onClick={() => onSelect(folder.id)}
        >
          <Folder className="h-4 w-4 mr-2" />
          <span className="text-sm">{folder.name}</span>
        </div>
        <AccordionTrigger className="px-2 border-l" />
      </div>
      <AccordionContent className="pb-0 pl-6">
        {childFolders.map(childFolder => (
          <FolderSelectItem
            key={childFolder.id}
            folder={childFolder}
            allFolders={allFolders}
            selectedFolderId={selectedFolderId}
            onSelect={onSelect}
          />
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

export default BookmarksPage;
