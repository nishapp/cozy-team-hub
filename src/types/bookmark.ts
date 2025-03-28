
export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  tags?: string[];
  isPrivate?: boolean; // New field to track privacy status
}

export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarks: BookmarkItem[];
  isPrivate?: boolean; // New field to track privacy status
}

export interface DragItem {
  type: 'bookmark' | 'folder';
  id: string;
  parentId?: string | null;
}
