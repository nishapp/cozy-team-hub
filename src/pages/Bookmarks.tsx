
import { useState, useEffect, useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Folder, Link, Trash2, Edit, Grid, List, X, ChevronRight, ChevronDown, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/ui/PageTransition";

// Types
interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  tags?: string[];
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
      description: 'Official React documentation',
      tags: ['programming', 'javascript', 'frontend'],
      folderId: 'programming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'TypeScript Documentation',
      url: 'https://www.typescriptlang.org',
      description: 'Learn TypeScript from scratch',
      tags: ['programming', 'typescript', 'javascript'],
      folderId: 'programming',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'BBC News',
      url: 'https://www.bbc.com/news',
      description: 'Latest news from around the world',
      tags: ['news', 'current affairs'],
      folderId: 'root',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Italian Pasta Recipes',
      url: 'https://www.bonappetit.com/recipes/pasta',
      description: 'Delicious pasta recipes from Italy',
      tags: ['cooking', 'italian', 'pasta'],
      folderId: 'cooking',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Gordon Ramsay YouTube Channel',
      url: 'https://www.youtube.com/user/gordonramsay',
      description: 'Cooking tutorials by Gordon Ramsay',
      tags: ['cooking', 'video', 'chef'],
      folderId: 'cooking',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'The New York Times',
      url: 'https://www.nytimes.com',
      description: 'Breaking news, reviews and opinion',
      tags: ['news', 'journalism'],
      folderId: 'root',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'TechCrunch',
      url: 'https://techcrunch.com',
      description: 'Latest technology news and startup information',
      tags: ['tech', 'startups', 'news'],
      folderId: 'tech',
      createdAt: new Date().toISOString(),
    },
  ];

  return { folders, bookmarks };
};

// Component
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
    description: '',
    tags: '',
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
    const storedFolders = getFromStorage<Folder[]>(STORAGE_KEYS.FOLDERS, []);
    const storedBookmarks = getFromStorage<Bookmark[]>(STORAGE_KEYS.BOOKMARKS, []);

    if (storedFolders.length === 0 || storedBookmarks.length === 0) {
      // Initialize with mock data if no data exists
      const { folders: mockFolders, bookmarks: mockBookmarks } = createMockData();
      setFolders(mockFolders);
      setBookmarks(mockBookmarks);
      saveToStorage(STORAGE_KEYS.FOLDERS, mockFolders);
      saveToStorage(STORAGE_KEYS.BOOKMARKS, mockBookmarks);
    } else {
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
    
    // Recursively get children of children
    const grandchildIds = childFolders.flatMap(f => getChildFolderIds(f.id));
    
    return [...childIds, ...grandchildIds];
  }, [folders]);

  // Filter bookmarks by search term and folder
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = searchTerm === '' || 
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bookmark.description && bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFolder = bookmark.folderId === selectedFolderId || 
      // Include child folder bookmarks when parent folder is selected
      (getChildFolderIds(selectedFolderId).includes(bookmark.folderId));
    
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

  // Handle adding a new bookmark
  const handleAddBookmark = () => {
    const { title, url, description, tags } = formData;
    
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    const folderId = formData.folderId || selectedFolderId;

    const newBookmark: Bookmark = {
      id: uuidv4(),
      title,
      url,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      folderId,
      createdAt: new Date().toISOString(),
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    setFormData({
      title: '',
      url: '',
      description: '',
      tags: '',
      folderId: '',
    });
    setIsAddBookmarkOpen(false);
    toast.success(`Bookmark "${title}" added`);
  };

  // Handle bookmark edit
  const handleEditBookmark = () => {
    if (!currentBookmark) return;
    
    const { title, url, description, tags, folderId } = formData;
    
    if (!title.trim() || !url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    const updatedBookmark: Bookmark = {
      ...currentBookmark,
      title,
      url,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
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
      description: bookmark.description || '',
      tags: bookmark.tags ? bookmark.tags.join(', ') : '',
      folderId: bookmark.folderId,
    });
    setIsEditBookmarkOpen(true);
  };

  // Handle drag end for bookmarks and folders
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Handle dragging bookmarks
    if (active.id !== over.id) {
      // Move bookmark to another bookmark's position
      if (draggedItemRef.current?.type === 'bookmark' && over.id.toString().includes('bookmark:')) {
        const targetId = over.id.toString().replace('bookmark:', '');
        const bookmarkId = active.id.toString().replace('bookmark:', '');
        
        // Rearrange bookmarks in the same folder
        const activeIndex = bookmarks.findIndex(b => b.id === bookmarkId);
        const overIndex = bookmarks.findIndex(b => b.id === targetId);
        
        setBookmarks(prev => arrayMove(prev, activeIndex, overIndex));
      }
      
      // Move bookmark to a folder
      if (draggedItemRef.current?.type === 'bookmark' && over.id.toString().includes('folder:')) {
        const folderId = over.id.toString().replace('folder:', '');
        const bookmarkId = active.id.toString().replace('bookmark:', '');
        
        // Update bookmark's folder
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

  // Render folder tree recursively
  const renderFolders = (parentId: string | null, depth = 0) => {
    const childFolders = folders.filter(folder => folder.parentId === parentId);
    
    return childFolders.map(folder => {
      const isExpanded = folder.isExpanded ?? false;
      const hasChildren = folders.some(f => f.parentId === folder.id);
      
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
                        
                        {bookmark.description && (
                          <p className="text-sm mt-2 line-clamp-2">{bookmark.description}</p>
                        )}
                        
                        {bookmark.tags && bookmark.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {bookmark.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-muted text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
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
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
              <Input
                id="description"
                placeholder="A brief description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="tags" className="text-sm font-medium">Tags (optional, comma separated)</label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
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
            <div className="grid gap-2">
              <label htmlFor="edit-description" className="text-sm font-medium">Description (optional)</label>
              <Input
                id="edit-description"
                placeholder="A brief description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-tags" className="text-sm font-medium">Tags (optional, comma separated)</label>
              <Input
                id="edit-tags"
                placeholder="tag1, tag2, tag3"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
              />
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
