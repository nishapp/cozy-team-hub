
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { BookmarksSidebar } from "@/components/bookmarks/BookmarksSidebar";
import { BookmarksContent } from "@/components/bookmarks/BookmarksContent"; 
import { Toaster } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";
import { initialBookmarksData } from "@/data/initialBookmarks";
import PageTransition from "@/components/ui/PageTransition";

const Bookmarks = () => {
  // Get bookmarks data from local storage or use initial data
  const [bookmarksData, setBookmarksData] = useLocalStorage<{
    folders: BookmarkFolder[];
    rootBookmarks: BookmarkItem[];
  }>("bookmarks-data", initialBookmarksData);

  // State for currently selected folder
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Find the selected folder from the folders array
  const selectedFolder = selectedFolderId
    ? bookmarksData.folders.find((folder) => folder.id === selectedFolderId)
    : null;

  // Contents to display based on current selection
  const currentContents = selectedFolder
    ? {
        folders: bookmarksData.folders.filter(
          (folder) => folder.parentId === selectedFolderId
        ),
        bookmarks: bookmarksData.folders
          .find((folder) => folder.id === selectedFolderId)
          ?.bookmarks || [],
        breadcrumbs: getBreadcrumbs(selectedFolderId, bookmarksData.folders),
        currentFolder: selectedFolder,
      }
    : {
        folders: bookmarksData.folders.filter((folder) => !folder.parentId),
        bookmarks: bookmarksData.rootBookmarks,
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
        <div className="flex flex-1 overflow-hidden">
          <BookmarksSidebar
            folders={bookmarksData.folders}
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
            allFolders={bookmarksData.folders}
            rootBookmarks={bookmarksData.rootBookmarks}
          />
        </div>
        <Toaster position="bottom-right" />
      </div>
    </PageTransition>
  );
};

export default Bookmarks;
