
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";

// Sample root bookmarks
const rootBookmarks: BookmarkItem[] = [
  {
    id: "bookmark-1",
    title: "GitHub",
    url: "https://github.com",
    description: "Where the world builds software",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "https://github.com/favicon.ico",
  },
  {
    id: "bookmark-2",
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    description: "Where developers learn and share knowledge",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: "https://stackoverflow.com/favicon.ico",
  },
];

// Sample folders with bookmarks
const folders: BookmarkFolder[] = [
  {
    id: "folder-1",
    name: "Development",
    description: "Programming resources",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarks: [
      {
        id: "bookmark-3",
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org",
        description: "Resources for developers, by developers",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://developer.mozilla.org/favicon.ico",
      },
      {
        id: "bookmark-4",
        title: "React Documentation",
        url: "https://reactjs.org",
        description: "React library documentation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://reactjs.org/favicon.ico",
      },
    ],
  },
  {
    id: "folder-2",
    name: "Design",
    description: "Design resources and inspiration",
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarks: [
      {
        id: "bookmark-5",
        title: "Dribbble",
        url: "https://dribbble.com",
        description: "Design inspiration and creative community",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://dribbble.com/favicon.ico",
      },
      {
        id: "bookmark-6",
        title: "Behance",
        url: "https://www.behance.net",
        description: "Showcase and discover creative work",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://www.behance.net/favicon.ico",
      },
    ],
  },
  {
    id: "folder-3",
    name: "JavaScript",
    description: "JavaScript resources",
    parentId: "folder-1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bookmarks: [
      {
        id: "bookmark-7",
        title: "JavaScript.info",
        url: "https://javascript.info",
        description: "Modern JavaScript Tutorial",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://javascript.info/favicon.ico",
      },
      {
        id: "bookmark-8",
        title: "TypeScript Documentation",
        url: "https://www.typescriptlang.org/docs/",
        description: "TypeScript documentation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: "https://www.typescriptlang.org/favicon.ico",
      },
    ],
  },
];

export const initialBookmarksData = {
  folders,
  rootBookmarks,
};
