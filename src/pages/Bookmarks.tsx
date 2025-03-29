
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Folder, 
  BookmarkIcon, 
  Grid2X2, 
  List, 
  Plus, 
  MoreHorizontal,
  FolderPlus,
  ExternalLink,
  Trash,
  Edit,
  Globe
} from "lucide-react";
import BookmarkFolder from "@/components/bookmarks/BookmarkFolder";
import BookmarkGrid from "@/components/bookmarks/BookmarkGrid";
import BookmarkList from "@/components/bookmarks/BookmarkList";
import BookmarkBreadcrumb from "@/components/bookmarks/BookmarkBreadcrumb";
import AddBookmarkDialog from "@/components/bookmarks/AddBookmarkDialog";
import AddFolderDialog from "@/components/bookmarks/AddFolderDialog";
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { BookmarkFolder as BookmarkFolderType, Bookmark as BookmarkType } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import EmptyState from "@/components/bookmarks/EmptyState";

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<BookmarkFolderType[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{id: string | null, name: string}[]>([
    { id: null, name: "All Bookmarks" }
  ]);
  const [isAddBookmarkOpen, setIsAddBookmarkOpen] = useState(false);
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetch bookmarks and folders
  useEffect(() => {
    if (!user) return;
    
    const fetchBookmarks = async () => {
      setLoading(true);
      
      try {
        // Fetch folders
        const { data: folderData, error: folderError } = await supabase
          .from('bookmark_folders')
          .select('*')
          .eq('user_id', user.id)
          .order('order', { ascending: true });
          
        if (folderError) throw folderError;
        
        // Fetch bookmarks
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .eq('folder_id', currentFolder)
          .order('order', { ascending: true });
          
        if (bookmarkError) throw bookmarkError;
        
        // Update state
        setFolders(folderData || []);
        setBookmarks(bookmarkData || []);
        
        // Build breadcrumbs if we're in a subfolder
        if (currentFolder) {
          buildBreadcrumbs(currentFolder, folderData || []);
        } else {
          setBreadcrumbs([{ id: null, name: "All Bookmarks" }]);
        }
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        toast.error("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookmarks();
  }, [user, currentFolder]);
  
  // Build breadcrumbs for navigation
  const buildBreadcrumbs = (folderId: string, allFolders: BookmarkFolderType[]) => {
    const breadcrumbsArray: {id: string | null, name: string}[] = [];
    let currentId = folderId;
    
    // Start with the current folder
    const currentFolderObj = allFolders.find(f => f.id === currentId);
    
    if (!currentFolderObj) {
      setBreadcrumbs([{ id: null, name: "All Bookmarks" }]);
      return;
    }
    
    breadcrumbsArray.unshift({ id: currentId, name: currentFolderObj.name });
    
    // Add parent folders
    while (currentFolderObj && currentFolderObj.parent_id) {
      const parentFolder = allFolders.find(f => f.id === currentFolderObj.parent_id);
      if (parentFolder) {
        breadcrumbsArray.unshift({ id: parentFolder.id, name: parentFolder.name });
        currentId = parentFolder.id;
      } else {
        break;
      }
    }
    
    // Add root
    breadcrumbsArray.unshift({ id: null, name: "All Bookmarks" });
    
    setBreadcrumbs(breadcrumbsArray);
  };
  
  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
  };
  
  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };
  
  const handleAddBookmark = async (bookmark: Partial<BookmarkType>) => {
    try {
      // Get max order for current folder
      const maxOrder = bookmarks.length > 0 
        ? Math.max(...bookmarks.map(b => b.order)) + 1 
        : 0;
        
      const newBookmark = {
        ...bookmark,
        folder_id: currentFolder,
        user_id: user?.id,
        order: maxOrder,
      };
      
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([newBookmark])
        .select()
        .single();
        
      if (error) throw error;
      
      setBookmarks([...bookmarks, data]);
      toast.success("Bookmark added successfully");
      setIsAddBookmarkOpen(false);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      toast.error("Failed to add bookmark");
    }
  };
  
  const handleAddFolder = async (folder: Partial<BookmarkFolderType>) => {
    try {
      // Get max order for current parent
      const foldersInSameParent = folders.filter(f => f.parent_id === currentFolder);
      const maxOrder = foldersInSameParent.length > 0 
        ? Math.max(...foldersInSameParent.map(f => f.order)) + 1 
        : 0;
        
      const newFolder = {
        ...folder,
        parent_id: currentFolder,
        user_id: user?.id,
        order: maxOrder,
      };
      
      const { data, error } = await supabase
        .from('bookmark_folders')
        .insert([newFolder])
        .select()
        .single();
        
      if (error) throw error;
      
      setFolders([...folders, data]);
      toast.success("Folder created successfully");
      setIsAddFolderOpen(false);
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Determine if we're dragging a bookmark or folder
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const isActiveBookmark = activeId.startsWith('bookmark-');
    const isOverBookmark = overId.startsWith('bookmark-');
    const isOverFolder = overId.startsWith('folder-');
    
    // Get the actual IDs without prefixes
    const actualActiveId = activeId.replace(/^(bookmark-|folder-)/, '');
    const actualOverId = overId.replace(/^(bookmark-|folder-)/, '');
    
    // Handle bookmark to bookmark reordering
    if (isActiveBookmark && isOverBookmark) {
      const oldIndex = bookmarks.findIndex(b => b.id === actualActiveId);
      const newIndex = bookmarks.findIndex(b => b.id === actualOverId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
        setBookmarks(newBookmarks);
        
        // Update orders in database
        await Promise.all(
          newBookmarks.map(async (bookmark, index) => {
            await supabase
              .from('bookmarks')
              .update({ order: index })
              .eq('id', bookmark.id);
          })
        );
      }
    }
    
    // Handle bookmark to folder movement
    if (isActiveBookmark && isOverFolder) {
      const bookmark = bookmarks.find(b => b.id === actualActiveId);
      
      if (bookmark) {
        // Remove from current bookmarks
        setBookmarks(bookmarks.filter(b => b.id !== actualActiveId));
        
        // Update in database
        await supabase
          .from('bookmarks')
          .update({ folder_id: actualOverId })
          .eq('id', actualActiveId);
          
        toast.success("Bookmark moved to folder");
      }
    }
  };
  
  const handleDeleteBookmark = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setBookmarks(bookmarks.filter(b => b.id !== id));
      toast.success("Bookmark deleted");
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast.error("Failed to delete bookmark");
    }
  };
  
  const handleDeleteFolder = async (id: string) => {
    try {
      // Check if folder has bookmarks or subfolders
      const { data: folderBookmarks } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('folder_id', id);
        
      const { data: subfolders } = await supabase
        .from('bookmark_folders')
        .select('id')
        .eq('parent_id', id);
        
      if ((folderBookmarks && folderBookmarks.length > 0) || 
          (subfolders && subfolders.length > 0)) {
        toast.error("Cannot delete non-empty folder");
        return;
      }
      
      const { error } = await supabase
        .from('bookmark_folders')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setFolders(folders.filter(f => f.id !== id));
      toast.success("Folder deleted");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };
  
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Filter folders for current level
  const currentFolders = folders.filter(folder => folder.parent_id === currentFolder);
  
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Bookmarks</h1>
              <BookmarkBreadcrumb 
                breadcrumbs={breadcrumbs} 
                onBreadcrumbClick={handleBreadcrumbClick} 
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List size={18} /> : <Grid2X2 size={18} />}
                <span className="ml-2">{viewMode === "grid" ? "List View" : "Grid View"}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddFolderOpen(true)}
              >
                <FolderPlus size={18} />
                <span className="ml-2">New Folder</span>
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddBookmarkOpen(true)}
              >
                <Plus size={18} />
                <span className="ml-2">Add Bookmark</span>
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={[
                  ...currentFolders.map(f => `folder-${f.id}`),
                  ...bookmarks.map(b => `bookmark-${b.id}`)
                ]}
                strategy={verticalListSortingStrategy}
              >
                {currentFolders.length === 0 && bookmarks.length === 0 ? (
                  <EmptyState 
                    onAddBookmark={() => setIsAddBookmarkOpen(true)}
                    onAddFolder={() => setIsAddFolderOpen(true)}
                  />
                ) : (
                  <div className="space-y-6">
                    {currentFolders.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Folders</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {currentFolders.map(folder => (
                            <BookmarkFolder
                              key={folder.id}
                              id={`folder-${folder.id}`}
                              folder={folder}
                              onClick={() => handleFolderClick(folder.id)}
                              onDelete={() => handleDeleteFolder(folder.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {bookmarks.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Bookmarks</h2>
                        {viewMode === "grid" ? (
                          <BookmarkGrid 
                            bookmarks={bookmarks} 
                            onDelete={handleDeleteBookmark}
                          />
                        ) : (
                          <BookmarkList 
                            bookmarks={bookmarks} 
                            onDelete={handleDeleteBookmark}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </SortableContext>
            </DndContext>
          )}
        </main>
        
        <AddBookmarkDialog
          isOpen={isAddBookmarkOpen}
          onClose={() => setIsAddBookmarkOpen(false)}
          onAdd={handleAddBookmark}
        />
        
        <AddFolderDialog
          isOpen={isAddFolderOpen}
          onClose={() => setIsAddFolderOpen(false)}
          onAdd={handleAddFolder}
        />
      </div>
    </PageTransition>
  );
};

export default Bookmarks;
