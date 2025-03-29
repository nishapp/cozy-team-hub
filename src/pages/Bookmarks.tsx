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
import { Card, CardContent } from "@/components/ui/card";
import { Glow } from "@/components/ui/glow";
import { cn } from "@/lib/utils";

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

const STORAGE_KEYS = {
  BOOKMARKS: 'wdylt_bookmarks',
  FOLDERS: 'wdylt_folders',
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const storedData = localStorage.getItem(key);
  return storedData ? JSON.parse(storedData) : defaultValue;
};

const saveToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const getChildFolderIds = useCallback((folderId: string): string[] => {
    const childFolders = folders.filter(f => f.parentId === folderId);
    const childIds = childFolders.map(f => f.id);
    
    const grandchildIds = childFolders.flatMap(f => getChildFolderIds(f.id));
    
    return [...childIds, ...grandchildIds];
  }, [folders]);

  const countBookmarksInFolder = useCallback((folderId: string): number => {
    const childFolderIds = getChildFolderIds(folderId);
    const allFolderIds = [folderId, ...childFolderIds];
    
    return bookmarks.filter(bookmark => 
      allFolderIds.includes(bookmark.folderId)
    ).length;
  }, [bookmarks, getChildFolderIds]);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchTerm === '' || 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFolder = bookmark.folderId === selectedFolderId || 
      getChildFolderIds(selectedFolderId).includes(bookmark.folderId);
    
    return matchesSearch && matchesFolder;
  });

  const getFolderPath = useCallback((folderId: string, path: Folder[] = []): Folder[] => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return path;
    
    const newPath = [folder, ...path];
    
    if (folder.parentId === null) return newPath;
    return getFolderPath(folder.parentId, newPath);
  }, [folders]);

  const toggleBookmarkVisibility = (bookmarkId: string) => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isPublic: !bookmark.isPublic } 
          : bookmark
      )
    );
  };

  const toggleFolderExpanded = (folderId: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isExpanded: !folder.isExpanded } 
          : folder
      )
    );
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    const newFolder: Folder = {
      id: uuidv4(),
      name: newFolderName,
      parentId: parentFolderId,
      isExpanded: false,
      createdAt: new Date().toISOString(),
    };

    setFolders(prev => [...prev, newFolder]);
    setNewFolderName('');
    setIsAddFolderOpen(false);
    toast.success(`Folder "${newFolderName}" created`);
  };

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

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    toast.success('Bookmark deleted');
  };

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

  const renderFolders = (parentId: string | null, depth = 0) => {
    const childFolders = folders.filter(folder => folder.parentId === parentId);
    
    return childFolders.map(folder => {
      const isExpanded = folder.isExpanded ?? false;
      const hasChildren = folders.some(f => f.parentId === folder.id);
      const bookmarkCount = countBookmarksInFolder(folder.id);
      
      return (
        <div key={folder.id}>
          <div 
            className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-all duration-200 ${
              selectedFolderId === folder.id 
                ? 'bg-primary/10 text-primary' 
                : 'hover:bg-muted hover:scale-[1.01]'
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

  const folderPath = getFolderPath(selectedFolderId);
  
  const currentFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <PageTransition>
      <div className="container py-6">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">{currentFolder?.name || 'Bookmarks'}</h1>
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
              className="w-full sm:w-64 transition-all duration-200 hover:border-primary/50 focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hover:border-primary hover:text-primary transition-all duration-200">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="animate-fade-in">
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
                <TabsTrigger value="grid" className="data-[state=active]:bg-primary/10"><Grid className="h-4 w-4" /></TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-primary/10"><List className="h-4 w-4" /></TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="relative overflow-hidden border-transparent smooth-transition">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none rounded-lg opacity-50" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Folders</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setParentFolderId('root');
                      setIsAddFolderOpen(true);
                    }}
                    className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
                  {renderFolders(null)}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookmarks.length > 0 ? (
                    filteredBookmarks.map(bookmark => (
                      <div
                        key={`bookmark:${bookmark.id}`}
                        id={`bookmark:${bookmark.id}`}
                        className="group relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        <Card className="h-full transition-all duration-300 group-hover:shadow-md group-hover:border-primary/20 border-transparent bg-card/90 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium truncate">{bookmark.title}</h3>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => toggleBookmarkVisibility(bookmark.id)}
                                  title={bookmark.isPublic ? "Public" : "Private"}
                                >
                                  {bookmark.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                </Button>
                                <CreateBitFromBookmark bookmark={bookmark} />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => openEditBookmarkModal(bookmark)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive/80 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                          </CardContent>
                        </Card>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                      {searchTerm ? 'No bookmarks match your search' : 'No bookmarks in this folder'}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="overflow-hidden border-transparent bg-card/90 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-primary/10">
                  {filteredBookmarks.length > 0 ? (
                    <div className="divide-y">
                      {filteredBookmarks.map(bookmark => (
                        <div
                          key={`bookmark:${bookmark.id}`}
                          id={`bookmark:${bookmark.id}`}
                          className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200"
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
                          
                          <div className="flex items-center space-x-2 ml-4 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
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
                </Card>
              )}
            </DndContext>
          </div>
        </div>
      </div>

      <Dialog open={isAddBookmarkOpen} onOpenChange={setIsAddBookmarkOpen}>
        <DialogContent className="sm:max-w-md">
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
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddBookmarkOpen(false)}>Cancel</Button>
            <Button onClick={handleAddBookmark} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditBookmarkOpen} onOpenChange={setIsEditBookmarkOpen}>
        <DialogContent className="sm:max-w-md">
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
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditBookmarkOpen(false)}>Cancel</Button>
            <Button onClick={handleEditBookmark} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-md">
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
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFolder} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Bookmarks;
