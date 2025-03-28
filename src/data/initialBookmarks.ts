
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
          description: "Project management tool for tracking tasks and issues",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        },
        {
          id: "bookmark-2",
          title: "GitHub",
          url: "https://github.com",
          description: "Code repository and version control platform",
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
          description: "Comprehensive resource for web development documentation",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        },
        {
          id: "bookmark-7",
          title: "React Official Documentation",
          url: "https://reactjs.org/docs/getting-started.html",
          description: "Official documentation for the React JavaScript library",
          createdAt: "2023-02-10T14:30:00Z",
          updatedAt: "2023-02-10T14:30:00Z",
        },
        {
          id: "bookmark-8",
          title: "TypeScript Handbook",
          url: "https://www.typescriptlang.org/docs/handbook/intro.html",
          description: "Official TypeScript documentation with comprehensive guides",
          createdAt: "2023-02-15T09:15:00Z",
          updatedAt: "2023-02-15T09:15:00Z",
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
          description: "Modern JavaScript tutorial with detailed explanations and examples",
          createdAt: "2023-01-15T12:00:00Z",
          updatedAt: "2023-01-15T12:00:00Z",
        },
        {
          id: "bookmark-9",
          title: "Eloquent JavaScript",
          url: "https://eloquentjavascript.net/",
          description: "A comprehensive book about JavaScript, programming, and the wonders of the digital world",
          createdAt: "2023-03-05T11:20:00Z",
          updatedAt: "2023-03-05T11:20:00Z",
        }
      ]
    },
    {
      id: "folder-4",
      name: "Design Resources",
      description: "UI/UX design resources and inspiration",
      parentId: null,
      createdAt: "2023-02-20T10:00:00Z",
      updatedAt: "2023-02-20T10:00:00Z",
      bookmarks: [
        {
          id: "bookmark-10",
          title: "Dribbble",
          url: "https://dribbble.com",
          description: "Design inspiration and creative community for designers",
          createdAt: "2023-02-20T10:05:00Z",
          updatedAt: "2023-02-20T10:05:00Z",
        },
        {
          id: "bookmark-11",
          title: "Tailwind CSS",
          url: "https://tailwindcss.com/docs",
          description: "A utility-first CSS framework for rapidly building custom designs",
          createdAt: "2023-02-21T15:30:00Z",
          updatedAt: "2023-02-21T15:30:00Z",
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
      description: "Video sharing platform with educational content and tutorials",
      createdAt: "2023-01-15T12:00:00Z",
      updatedAt: "2023-01-15T12:00:00Z",
    },
    {
      id: "bookmark-12",
      title: "Web Development Roadmap 2023",
      url: "https://roadmap.sh/frontend",
      description: "Step by step guide to becoming a modern frontend developer in 2023",
      createdAt: "2023-01-28T16:45:00Z",
      updatedAt: "2023-01-28T16:45:00Z",
    },
    {
      id: "bookmark-13",
      title: "CSS Tricks",
      url: "https://css-tricks.com",
      description: "Tips, tricks, and techniques on using CSS and web design",
      createdAt: "2023-02-05T09:30:00Z",
      updatedAt: "2023-02-05T09:30:00Z",
    }
  ]
};
