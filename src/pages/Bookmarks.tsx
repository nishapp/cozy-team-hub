
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { BookmarksSidebar } from "@/components/bookmarks/BookmarksSidebar";
import { BookmarksContent } from "@/components/bookmarks/BookmarksContent"; 
import { Toaster } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";
import { initialBookmarksData } from "@/data/initialBookmarks";
import PageTransition from "@/components/ui/PageTransition";
import { SidebarProvider } from "@/components/ui/sidebar";

// Make sure existing bookmarks data is migrated to include the isPrivate field
const migrateBookmarksData = (data: any) => {
  const folders = data.folders.map((folder: any) => ({
    ...folder,
    isPrivate: folder.isPrivate !== undefined ? folder.isPrivate : false,
    bookmarks: folder.bookmarks.map((bookmark: any) => ({
      ...bookmark,
      isPrivate: bookmark.isPrivate !== undefined ? bookmark.isPrivate : false,
    })),
  }));

  const rootBookmarks = data.rootBookmarks.map((bookmark: any) => ({
    ...bookmark,
    isPrivate: bookmark.isPrivate !== undefined ? bookmark.isPrivate : false,
  }));

  return { folders, rootBookmarks };
};

const Bookmarks = () => {
  // Get bookmarks data from local storage or use initial data
  const [bookmarksData, setBookmarksData] = useLocalStorage<{
    folders: BookmarkFolder[];
    rootBookmarks: BookmarkItem[];
  }>("bookmarks-data", initialBookmarksData);

  // Migrate existing data to include the isPrivate field
  const migratedData = migrateBookmarksData(bookmarksData);

  // State for currently selected folder
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Find the selected folder from the folders array
  const selectedFolder = selectedFolderId
    ? migratedData.folders.find((folder) => folder.id === selectedFolderId)
    : null;

  // Contents to display based on current selection
  const currentContents = selectedFolder
    ? {
        folders: migratedData.folders.filter(
          (folder) => folder.parentId === selectedFolderId
        ),
        bookmarks: migratedData.folders
          .find((folder) => folder.id === selectedFolderId)
          ?.bookmarks || [],
        breadcrumbs: getBreadcrumbs(selectedFolderId, migratedData.folders),
        currentFolder: selectedFolder,
      }
    : {
        folders: migratedData.folders.filter((folder) => !folder.parentId),
        bookmarks: migratedData.rootBookmarks,
        breadcrumbs: [],
        currentFolder: null,
      };

  // Helper function to generate breadcrumbs for navigation
  function getBreadcrumbs(
    folderId: string | null,
    folders: BookmarkFolder[]
  ): { id: string; name: string }[] {
    if (!folderId) return [];

    const breadcrumbs: { id: string; name: string }[] = [];
    let currentId = folderId;

    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId || null;
      } else {
        break;
      }
    }

    return breadcrumbs;
  }

  // Handle folder selection
  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  // Update bookmarks data
  const updateBookmarksData = (
    newData: {
      folders: BookmarkFolder[];
      rootBookmarks: BookmarkItem[];
    }
  ) => {
    setBookmarksData(newData);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <SidebarProvider>
          <div className="flex flex-1 overflow-hidden w-full">
            <BookmarksSidebar
              folders={migratedData.folders}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleFolderSelect}
              updateBookmarksData={updateBookmarksData}
            />
            <BookmarksContent
              folders={currentContents.folders}
              bookmarks={currentContents.bookmarks}
              breadcrumbs={currentContents.breadcrumbs}
              currentFolder={currentContents.currentFolder}
              selectedFolderId={selectedFolderId}
              onSelectFolder={handleFolderSelect}
              updateBookmarksData={updateBookmarksData}
              allFolders={migratedData.folders}
              rootBookmarks={migratedData.rootBookmarks}
            />
          </div>
        </SidebarProvider>
        <Toaster position="bottom-right" />
      </div>
    </PageTransition>
  );
};

export default Bookmarks;
