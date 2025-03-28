
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";

// Initial sample bookmark data
export const initialBookmarksData: {
  folders: BookmarkFolder[];
  rootBookmarks: BookmarkItem[];
} = {
  folders: [
    {
      id: "folder-1",
      name: "Work",
      description: "Work-related resources and tools",
      parentId: null,
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
      bookmarks: [
        {
          id: "bookmark-1",
          title: "Jira",
          url: "https://jira.com",
          description: "Project management tool",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        },
        {
          id: "bookmark-2",
          title: "GitHub",
          url: "https://github.com",
          description: "Code repository",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        }
      ]
    },
    {
      id: "folder-2",
      name: "Learning",
      description: "Learning resources and tutorials",
      parentId: null,
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
      bookmarks: [
        {
          id: "bookmark-3",
          title: "MDN Web Docs",
          url: "https://developer.mozilla.org",
          description: "Web development documentation",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        }
      ]
    },
    {
      id: "folder-3",
      name: "JavaScript",
      description: "JavaScript resources",
      parentId: "folder-2",
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
      bookmarks: [
        {
          id: "bookmark-4",
          title: "JavaScript.info",
          url: "https://javascript.info",
          description: "Modern JavaScript tutorial",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        }
      ]
    }
  ],
  rootBookmarks: [
    {
      id: "bookmark-5",
      title: "Google",
      url: "https://google.com",
      description: "Search engine",
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
    },
    {
      id: "bookmark-6",
      title: "YouTube",
      url: "https://youtube.com",
      description: "Video sharing platform",
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
    }
  ]
};
