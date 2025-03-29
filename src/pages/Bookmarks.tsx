import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Folder, Link, Trash2, Edit, Grid, List, ChevronRight, ChevronDown, Lock, Globe, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/ui/PageTransition";
import CreateBitFromBookmark from "@/components/bookmarks/CreateBitFromBookmark";

// Types
interface Bookmark {
  id: string;
  title: string;
  url: string;
  isPublic: boolean;
  createdAt: string;
  folderId: string;
}

interface Folder {
  id: string;
  name: string;
  icon?: string;
  parentId: string | null;
  isExpanded?: boolean;
  isSpecial?: boolean;
  specialType?: 'bits' | 'friends' | 'recent';
  createdAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  BOOKMARKS: 'wdylt_bookmarks',
  FOLDERS: 'wdylt_folders',
};

// LocalStorage helper functions
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock data with special folders
const createMockData = () => {
  const folders: Folder[] = [
    {
      id: 'root',
      name: 'All Bookmarks',
      parentId: null,
      isExpanded: true,
      isSpecial: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bits',
      name: 'My Bits',
      parentId: 'root',
      isExpanded: true,
      isSpecial: true,
      specialType: 'bits',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'friends',
      name: 'Friends Bits',
      parentId: 'root',
      isExpanded: true,
      isSpecial: true,
      specialType: 'friends',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'recent',
      name: 'Recent',
      parentId: 'root',
      isExpanded: true,
      isSpecial: true,
      specialType: 'recent',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tech',
      name: 'Technology',
      parentId: 'root',
      isExpanded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'programming',
      name: 'Programming',
      parentId: 'tech',
      isExpanded: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cooking',
      name: 'Cooking',
      parentId: 'root',
      isExpanded: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const bookmarks: Bookmark[] = [
    {
      id: uuidv4(),
      title: 'React Documentation',
      url: 'https://reactjs.org',
      isPublic: false,
      folderId: 'programming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'TypeScript Documentation',
      url: 'https://www.typescriptlang.org',
      isPublic: false,
      folderId: 'programming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'BBC News',
      url: 'https://www.bbc.com/news',
      isPublic: true,
      folderId: 'root',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Italian Pasta Recipes',
      url: 'https://www.bonappetit.com/recipes/pasta',
      isPublic: false,
      folderId: 'cooking',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Gordon Ramsay YouTube Channel',
      url: 'https://www.youtube.com/user/gordonramsay',
      isPublic: false,
      folderId: 'cooking',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'The New York Times',
      url: 'https://www.nytimes.com',
      isPublic: true,
      folderId: 'root',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'TechCrunch',
      url: 'https://techcrunch.com',
      isPublic: false,
      folderId: 'tech',
      createdAt: new Date().toISOString(),
    },
  ];

  return { folders, bookmarks };
};

const Bookmarks = () => {
  const { user } = useAuth();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isEditBookmarkOpen, setIsEditBookmarkOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    isPublic: false,
    folderId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | null>('root');
  const draggedItemRef = useRef<{ id: string; type: 'bookmark' | 'folder' } | null>(null);

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data from localStorage or initialize with mock data
  useEffect(() => {
    let storedFolders = getFromStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    let storedBookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);

    if (storedFolders.length === 0 || storedBookmarks.length === 0) {
      const { folders: mockFolders, bookmarks: mockBookmarks } = createMockData();
      setFolders(mockFolders);
      setBookmarks(mockBookmarks);
      saveToStorage(STORAGE_KEYS.FOLDERS, mockFolders);
      saveToStorage(STORAGE_KEYS.BOOKMARKS, mockBookmarks);
    } else {
      if (storedBookmarks.length > 0 && !('isPublic' in storedBookmarks[0])) {
        storedBookmarks = storedBookmarks.map(bookmark => ({
          ...bookmark,
          isPublic: false,
        }));
        saveToStorage(STORAGE_KEYS.BOOKMARKS, storedBookmarks);
      }
      
      setFolders(storedFolders);
      setBookmarks(storedBookmarks);
    }
  }, []);

  // Save changes to localStorage whenever state updates
  useEffect(() => {
    if (folders.length > 0) {
      saveToStorage(STORAGE_KEYS.FOLDERS, folders);
    }
  }, [folders]);

  useEffect(() => {
    if (bookmarks.length > 0) {
      saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
    }
  }, [bookmarks]);

  // Get all child folder IDs for a given folder
  const getChildFolderIds = useCallback((folderId: string): string[] => {
    const childFolders = folders.filter(f => f.parentId === folderId);
    const childIds = childFolders.map(f => f.id);
    
    const grandchildIds = childFolders.flatMap(f => getChildFolderIds(f.id));
    
    return [...childIds, ...grandchildIds];
  }, [folders]);

  // Count bookmarks in a folder including all nested folders
  const countBookmarksInFolder = useCallback((folderId: string): number => {
    const childFolderIds = getChildFolderIds(folderId);
    const allFolderIds = [folderId, ...childFolderIds];
    
    return bookmarks.filter(bookmark => 
      allFolderIds.includes(bookmark.folderId)
    ).length;
  }, [bookmarks, getChildFolderIds]);

  // Filter bookmarks by search term and folder
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchTerm === '' || 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder = bookmark.folderId === selectedFolderId || 
      getChildFolderIds(selectedFolderId).includes(bookmark.folderId);
    
    return matchesSearch && matchesFolder;
  });

  // Get folder path for display (breadcrumbs)
  const getFolderPath = useCallback((folderId: string, path: Folder[] = []): Folder[] => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return path;
    
    const newPath = [folder, ...path];
    
    if (folder.parentId === null) return newPath;
    return getFolderPath(folder.parentId, newPath);
  }, [folders]);

  // Toggle bookmark visibility
  const toggleBookmarkVisibility = (bookmarkId: string) => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isPublic: !bookmark.isPublic } 
          : bookmark
      )
    );
  };

  // Handle expanding/collapsing folders
  const toggleFolderExpanded = (folderId: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded } 
          : folder
      )
    );
  };

  // Handle selecting a folder
  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  // Handle adding a new folder
  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    const newFolderId = uuidv4();

    const newFolder: Folder = {
      id: newFolderId,
      name: newFolderName,
      parentId: parentFolderId,
      isExpanded: false,
      createdAt: new Date().toISOString(),
    };

    if (parentFolderId !== 'root' && !folders.some(folder => folder.id === parentFolderId)) {
      toast.error(`Parent folder doesn't exist`);
      return;
    }

    setFolders(prev => [...prev, newFolder]);
    
    setNewFolderName('');
    setIsAddFolderOpen(false);
    
    if (parentFolderId) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === parentFolderId 
            ? { ...folder, isExpanded: true } 
            : folder
        )
      );
    }
    
    setSelectedFolderId(newFolderId);
    
    toast.success(`Folder "${newFolderName}" created`);
  };

  // Handle adding a new bookmark
  const handleAddBookmark = () => {
    const { title, url, isPublic } = formData;
    
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    const folderId = formData.folderId || selectedFolderId;

    const newBookmark: Bookmark = {
      id: uuidv4(),
      title,
      url,
      isPublic,
      folderId,
      createdAt: new Date().toISOString(),
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    setFormData({
      title: '',
      url: '',
      isPublic: false,
      folderId: '',
    });
    setIsAddBookmarkOpen(false);
    toast.success(`Bookmark "${title}" added`);
  };

  // Handle bookmark edit
  const handleEditBookmark = () => {
    if (!currentBookmark) return;
    
    const { title, url, isPublic, folderId } = formData;
    
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    const updatedBookmark: Bookmark = {
      ...currentBookmark,
      title,
      url,
      isPublic,
      folderId: folderId || currentBookmark.folderId,
    };

    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === currentBookmark.id ? updatedBookmark : bookmark
      )
    );
    
    setCurrentBookmark(null);
    setIsEditBookmarkOpen(false);
    toast.success(`Bookmark "${title}" updated`);
  };

  // Handle bookmark delete
  const handleDeleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    toast.success('Bookmark deleted');
  };

  // Open edit bookmark modal
  const openEditBookmarkModal = (bookmark: Bookmark) => {
    setCurrentBookmark(bookmark);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      isPublic: bookmark.isPublic,
      folderId: bookmark.folderId,
    });
    setIsEditBookmarkOpen(true);
  };

  // Handle drag end for bookmarks and folders
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      if (draggedItemRef.current?.type === 'bookmark' && over.id.toString().includes('bookmark:')) {
        const targetId = over.id.toString().replace('bookmark:', '');
        const bookmarkId = active.id.toString().replace('bookmark:', '');
        
        const activeIndex = bookmarks.findIndex(b => b.id === bookmarkId);
        const overIndex = bookmarks.findIndex(b => b.id === targetId);
        
        setBookmarks(prev => arrayMove(prev, activeIndex, overIndex));
      }
      
      if (draggedItemRef.current?.type === 'bookmark' && over.id.toString().includes('folder:')) {
        const folderId = over.id.toString().replace('folder:', '');
        const bookmarkId = active.id.toString().replace('bookmark:', '');
        
        setBookmarks(prev => 
          prev.map(bookmark => 
            bookmark.id === bookmarkId 
              ? { ...bookmark, folderId } 
              : bookmark
          )
        );
        
        toast.success('Bookmark moved to folder');
      }
    }
    
    draggedItemRef.current = null;
  };

  // Set dragged item ref when drag starts
  const handleDragStart = (event: any) => {
    const id = event.active.id.toString();
    
    if (id.includes('bookmark:')) {
      draggedItemRef.current = {
        id: id.replace('bookmark:', ''),
        type: 'bookmark'
      };
    } else if (id.includes('folder:')) {
      draggedItemRef.current = {
        id: id.replace('folder:', ''),
        type: 'folder'
      };
    }
  };

  // Recursively render folders
  const renderFolders = (parentId: string | null, depth = 0) => {
    const childFolders = folders.filter(folder => folder.parentId === parentId);
    
    return childFolders.map(folder => {
      const isExpanded = folder.isExpanded ?? false;
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const bookmarkCount = countBookmarksInFolder(folder.id);
      
      return (
        <div key={folder.id}>
          <div 
            className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${
              selectedFolderId === folder.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
            }`}
            style={{ 
              paddingLeft: `${depth * 16 + 8}px`,
            }}
            onClick={() => handleSelectFolder(folder.id)}
          >
            {hasChildren && (
              <button
                className="w-6 h-6 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpanded(folder.id);
                }}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}
            <Folder className="mr-2 h-4 w-4" />
            <span className="truncate">{folder.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">{bookmarkCount}</span>
            {folder.isSpecial && <div className="ml-auto w-1 h-1 bg-primary rounded-full" />}
          </div>
          
          {isExpanded && hasChildren && renderFolders(folder.id, depth + 1)}
        </div>
      );
    });
  };

  // Breadcrumb for current folder
  const folderPath = getFolderPath(selectedFolderId);
  
  // Get current folder name
  const currentFolder = folders.find(f => f.id === selectedFolderId);

  // Handle subfolder creation
  const handleAddSubfolder = (parentId: string) => {
    setParentFolderId(parentId);
    setIsAddFolderOpen(true);
  };

  // Handle folder deletion
  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder?.isSpecial) {
      toast.error("Special folders cannot be deleted");
      return;
    }

    const childFolderIds = getChildFolderIds(folderId);
    const affectedBookmarks = bookmarks.filter(b => 
      b.folderId === folderId || childFolderIds.includes(b.folderId)
    );

    if (childFolderIds.length > 0 || affectedBookmarks.length > 0) {
      if (!window.confirm(
        `This will delete the folder, ${childFolderIds.length} subfolders, and move ${affectedBookmarks.length} bookmarks to parent folder. Continue?`
      )) {
        return;
      }
    }

    const folder = folders.find(f => f.id === folderId);
    const parentFolderId = folder?.parentId || 'root';

    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.folderId === folderId 
          ? { ...bookmark, folderId: parentFolderId } 
          : bookmark
      )
    );

    const updatedBookmarks = bookmarks.map(bookmark => {
      if (childFolderIds.includes(bookmark.folderId)) {
        return { ...bookmark, folderId: parentFolderId };
      }
      return bookmark;
    });
    setBookmarks(updatedBookmarks);

    setFolders(prev => prev.filter(folder => 
      folder.id !== folderId && !childFolderIds.includes(folder.id)
    ));

    if (selectedFolderId === folderId) {
      setSelectedFolderId(parentFolderId);
    }

    toast.success("Folder deleted");
  };

  return (
    <PageTransition>
      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{currentFolder?.name || 'Bookmarks'}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              {folderPath.map((folder, index) => (
                <div key={folder.id} className="flex items-center">
                  {index > 0 && <ChevronRight size={12} className="mx-1" />}
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleSelectFolder(folder.id)}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Input
              placeholder="Search bookmarks..."
              className="w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setFormData({...formData, folderId: selectedFolderId});
                  setIsAddBookmarkOpen(true);
                }}>
                  <Link className="mr-2 h-4 w-4" />
                  Add Bookmark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setParentFolderId(selectedFolderId);
                  setIsAddFolderOpen(true);
                }}>
                  <Folder className="mr-2 h-4 w-4" />
                  New Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
              <TabsList className="grid w-[80px] grid-cols-2">
                <TabsTrigger value="grid"><Grid className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Folders</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setParentFolderId('root');
                  setIsAddFolderOpen(true);
                }}
                className="h-8 px-2"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
              {renderFolders(null)}
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <div className="flex justify-end mb-4 space-x-2">
                {!currentFolder?.isSpecial && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddSubfolder(selectedFolderId)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Add Subfolder
                  </Button>
                )}
                
                {!currentFolder?.isSpecial && selectedFolderId !== 'root' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteFolder(selectedFolderId)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Folder
                  </Button>
                )}
              </div>
            
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks.length > 0 ? (
                    filteredBookmarks.map(bookmark => (
                      <div
                        key={`bookmark:${bookmark.id}`}
                        id={`bookmark:${bookmark.id}`}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium truncate">{bookmark.title}</h3>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleBookmarkVisibility(bookmark.id)}
                              title={bookmark.isPublic ? "Public" : "Private"}
                            >
                              {bookmark.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            </Button>
                            <CreateBitFromBookmark bookmark={bookmark} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditBookmarkModal(bookmark)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive/80 hover:text-destructive"
                              onClick={() => handleDeleteBookmark(bookmark.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary truncate block mt-1"
                        >
                          {bookmark.url}
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      {searchTerm ? 'No bookmarks match your search' : 'No bookmarks in this folder'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  {filteredBookmarks.length > 0 ? (
                    <div className="divide-y">
                      {filteredBookmarks.map(bookmark => (
                        <div
                          key={`bookmark:${bookmark.id}`}
                          id={`bookmark:${bookmark.id}`}
                          className="flex items-center justify-between p-4 hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{bookmark.title}</h3>
                            <a
                              href={bookmark.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-muted-foreground hover:text-primary truncate block"
                            >
                              {bookmark.url}
                            </a>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleBookmarkVisibility(bookmark.id)}
                              title={bookmark.isPublic ? "Public" : "Private"}
                            >
                              {bookmark.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                            <CreateBitFromBookmark bookmark={bookmark} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditBookmarkModal(bookmark)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive/80 hover:text-destructive"
                              onClick={() => handleDeleteBookmark(bookmark.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      {searchTerm ? 'No bookmarks match your search' : 'No bookmarks in this folder'}
                    </div>
                  )}
                </div>
              )}
            </DndContext>
          </div>
        </div>
      </div>

      {/* Add Bookmark Dialog */}
      <Dialog open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Bookmark title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="url" className="text-sm font-medium">URL</label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
              />
              <Label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                {formData.isPublic ? (
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Public bookmark
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Private bookmark
                  </span>
                )}
              </Label>
            </div>
            <div className="grid gap-2">
              <label htmlFor="folder" className="text-sm font-medium">Folder</label>
              <select
                id="folder"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.folderId || selectedFolderId}
                onChange={(e) => setFormData({...formData, folderId: e.target.value})}
              >
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBookmarkOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBookmark}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bookmark Dialog */}
      <Dialog open={isEditBookmarkOpen} onOpenChange={setIsEditBookmarkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bookmark</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                placeholder="Bookmark title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-url" className="text-sm font-medium">URL</label>
              <Input
                id="edit-url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({...formData, isPublic: checked})}
              />
              <Label htmlFor="edit-isPublic" className="text-sm font-medium cursor-pointer">
                {formData.isPublic ? (
                  <span className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Public bookmark
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Private bookmark
                  </span>
                )}
              </Label>
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-folder" className="text-sm font-medium">Folder</label>
              <select
                id="edit-folder"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.folderId}
                onChange={(e) => setFormData({...formData, folderId: e.target.value})}
              >
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBookmarkOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBookmark}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Folder Dialog */}
      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="folderName" className="text-sm font-medium">Folder Name</label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="parentFolder" className="text-sm font-medium">Parent Folder</label>
              <select
                id="parentFolder"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={parentFolderId || 'root'}
                onChange={(e) => setParentFolderId(e.target.value)}
              >
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFolder}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Bookmarks;
