
export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  icon?: string;
  tags?: string[];
  isPrivate: boolean;
  summary?: string; // Keep for backward compatibility
  imageUrl?: string; // Hero image URL from the webpage
}

export interface BookmarkFolder {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  bookmarks: BookmarkItem[];
  isPrivate: boolean; 
}

export interface DragItem {
  type: 'bookmark' | 'folder';
  id: string;
  parentId?: string | null;
}
