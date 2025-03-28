import React from "react";
import { BookmarkFolder, BookmarkItem } from "@/types/bookmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Folder,
  FolderPlus,
  Link as LinkIcon,
  MoreVertical,
  Plus,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSidebar } from "@/components/ui/sidebar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface BookmarksContentProps {
  folders: BookmarkFolder[];
  bookmarks: BookmarkItem[];
  breadcrumbs: { id: string; name: string }[];
  currentFolder: BookmarkFolder | null;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  updateBookmarksData: (data: {
    folders: BookmarkFolder[];
    rootBookmarks: BookmarkItem[];
  }) => void;
  allFolders: BookmarkFolder[];
  rootBookmarks: BookmarkItem[];
}

const BookmarksContent: React.FC<BookmarksContentProps> = ({
  folders,
  bookmarks,
  breadcrumbs,
  currentFolder,
  selectedFolderId,
  onSelectFolder,
  updateBookmarksData,
  allFolders,
  rootBookmarks,
}) => {
  const { toast } = useToast();
  const { closeSidebar } = useSidebar();

  // State for dialogs
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    React.useState(false);
  const [isCreateBookmarkDialogOpen, setIsCreateBookmarkDialogOpen] =
    React.useState(false);
  const [isEditFolderDialogOpen, setIsEditFolderDialogOpen] =
    React.useState(false);

  // State for managing the selected bookmark or folder for deletion/edit
  const [selectedBookmarkId, setSelectedBookmarkId] =
    React.useState<string | null>(null);
  const [selectedFolderForEdit, setSelectedFolderForEdit] =
    React.useState<BookmarkFolder | null>(null);

  // Handlers for opening dialogs
  const handleOpenCreateFolderDialog = () => {
    setIsCreateFolderDialogOpen(true);
    closeSidebar();
  };

  const handleOpenCreateBookmarkDialog = () => {
    setIsCreateBookmarkDialogOpen(true);
    closeSidebar();
  };

  const handleOpenEditFolderDialog = (folder: BookmarkFolder) => {
    setSelectedFolderForEdit(folder);
    setIsEditFolderDialogOpen(true);
    closeSidebar();
  };

  // Handlers for closing dialogs
  const handleCloseCreateFolderDialog = () => setIsCreateFolderDialogOpen(false);
  const handleCloseCreateBookmarkDialog = () =>
    setIsCreateBookmarkDialogOpen(false);
  const handleCloseEditFolderDialog = () => {
    setIsEditFolderDialogOpen(false);
    setSelectedFolderForEdit(null);
  };

  // Handler for breadcrumb click
  const handleBreadcrumbClick = (folderId: string | null) => {
    onSelectFolder(folderId);
  };

  // Handler for folder click
  const handleFolderClick = (folderId: string) => {
    onSelectFolder(folderId);
  };

  // Handler for deleting a bookmark
  const handleDeleteBookmark = (bookmarkId: string) => {
    setSelectedBookmarkId(bookmarkId);
  };

  const confirmDeleteBookmark = () => {
    if (!selectedBookmarkId) return;

    const updatedBookmarksData = {
      folders: allFolders.map((folder) => ({
        ...folder,
        bookmarks: folder.bookmarks.filter((b) => b.id !== selectedBookmarkId),
      })),
      rootBookmarks: rootBookmarks.filter((b) => b.id !== selectedBookmarkId),
    };

    updateBookmarksData(updatedBookmarksData);
    setSelectedBookmarkId(null);
    toast({
      title: "Bookmark deleted.",
      description: "The bookmark has been successfully removed.",
    });
  };

  // Handler for deleting a folder
  const handleDeleteFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const confirmDeleteFolder = () => {
    if (!selectedFolderId) return;

    // Function to recursively find all child folder IDs
    const getAllChildFolderIds = (folderId: string): string[] => {
      let childIds: string[] = [];
      const childFolders = allFolders.filter((f) => f.parentId === folderId);
      childFolders.forEach((child) => {
        childIds.push(child.id);
        childIds = childIds.concat(getAllChildFolderIds(child.id));
      });
      return childIds;
    };

    // Get all child folder IDs
    const childFolderIds = getAllChildFolderIds(selectedFolderId);

    // Filter out the selected folder and all its children
    const updatedFolders = allFolders.filter(
      (folder) => folder.id !== selectedFolderId && !childFolderIds.includes(folder.id)
    );

    // Also, remove any bookmarks that are within the deleted folders
    const updatedBookmarksData = {
      folders: updatedFolders.map((folder) => ({
        ...folder,
        bookmarks: folder.bookmarks, // Keep bookmarks, as they are not being deleted
      })),
      rootBookmarks: rootBookmarks, // Keep root bookmarks, as they are not being deleted
    };

    updateBookmarksData(updatedBookmarksData);
    onSelectFolder(currentFolder?.parentId || null);
    setSelectedFolderId(null);

    toast({
      title: "Folder deleted.",
      description: "The folder and its contents have been successfully removed.",
    });
  };

  // Zod schema for folder creation form
  const folderFormSchema = z.object({
    name: z.string().min(2, {
      message: "Folder name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
  });

  // React Hook Form for folder creation
  const folderForm = useForm<z.infer<typeof folderFormSchema>>({
    resolver: zodResolver(folderFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  // Handler for creating a new folder
  const handleCreateFolder = async (
    values: z.infer<typeof folderFormSchema>
  ) => {
    const newFolder: BookmarkFolder = {
      id: `folder-${Date.now()}`,
      name: values.name,
      description: values.description,
      parentId: selectedFolderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: values.isPrivate,
      bookmarks: [],
    };

    const updatedBookmarksData = {
      folders: [...allFolders, newFolder],
      rootBookmarks: rootBookmarks,
    };

    updateBookmarksData(updatedBookmarksData);
    handleCloseCreateFolderDialog();
    folderForm.reset();

    toast({
      title: "Folder created.",
      description: "Your new folder has been successfully created.",
    });
  };

  // Zod schema for bookmark creation form
  const bookmarkFormSchema = z.object({
    title: z.string().min(2, {
      message: "Bookmark title must be at least 2 characters.",
    }),
    url: z.string().url({ message: "Invalid URL format." }),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
  });

  // React Hook Form for bookmark creation
  const bookmarkForm = useForm<z.infer<typeof bookmarkFormSchema>>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      title: "",
      url: "",
      description: "",
      isPrivate: false,
    },
  });

  // Handler for creating a new bookmark
  const handleCreateBookmark = async (
    values: z.infer<typeof bookmarkFormSchema>
  ) => {
    const newBookmark: BookmarkItem = {
      id: `bookmark-${Date.now()}`,
      title: values.title,
      url: values.url,
      description: values.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPrivate: values.isPrivate,
    };

    const updatedBookmarksData = selectedFolderId
      ? {
          folders: allFolders.map((folder) =>
            folder.id === selectedFolderId
              ? { ...folder, bookmarks: [...folder.bookmarks, newBookmark] }
              : folder
          ),
          rootBookmarks: rootBookmarks,
        }
      : {
          folders: allFolders,
          rootBookmarks: [...rootBookmarks, newBookmark],
        };

    updateBookmarksData(updatedBookmarksData);
    handleCloseCreateBookmarkDialog();
    bookmarkForm.reset();

    toast({
      title: "Bookmark created.",
      description: "Your new bookmark has been successfully created.",
    });
  };

  // Zod schema for folder edit form
  const editFolderFormSchema = z.object({
    name: z.string().min(2, {
      message: "Folder name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
  });

  // React Hook Form for folder edit
  const editFolderForm = useForm<z.infer<typeof editFolderFormSchema>>({
    resolver: zodResolver(editFolderFormSchema),
    defaultValues: {
      name: selectedFolderForEdit?.name || "",
      description: selectedFolderForEdit?.description || "",
      isPrivate: selectedFolderForEdit?.isPrivate || false,
    },
    values: {
      name: selectedFolderForEdit?.name || "",
      description: selectedFolderForEdit?.description || "",
      isPrivate: selectedFolderForEdit?.isPrivate || false,
    },
    mode: "onChange",
  });

  React.useEffect(() => {
    if (selectedFolderForEdit) {
      editFolderForm.reset(selectedFolderForEdit);
    }
  }, [selectedFolderForEdit, editFolderForm]);

  // Handler for editing a folder
  const handleEditFolder = async (values: z.infer<typeof editFolderFormSchema>) => {
    if (!selectedFolderForEdit) return;

    const updatedFolders = allFolders.map((folder) =>
      folder.id === selectedFolderForEdit.id
        ? {
            ...folder,
            name: values.name,
            description: values.description,
            isPrivate: values.isPrivate,
            updatedAt: new Date().toISOString(),
          }
        : folder
    );

    const updatedBookmarksData = {
      folders: updatedFolders,
      rootBookmarks: rootBookmarks,
    };

    updateBookmarksData(updatedBookmarksData);
    handleCloseEditFolderDialog();

    toast({
      title: "Folder updated.",
      description: "The folder has been successfully updated.",
    });
  };

  return (
    <div className="flex-1 p-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            handleBreadcrumbClick(currentFolder?.parentId || null)
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.id}>
            <Button
              variant="link"
              size="sm"
              onClick={() => handleBreadcrumbClick(crumb.id)}
            >
              {crumb.name}
            </Button>
            {index < breadcrumbs.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Content Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {currentFolder ? currentFolder.name : "Root"}
        </h1>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateFolderDialog}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button size="sm" onClick={handleOpenCreateBookmarkDialog}>
            <Plus className="w-4 h-4 mr-2" />
            New Bookmark
          </Button>
        </div>
      </div>

      {/* Folder List */}
      {folders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="relative rounded-md border p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div onClick={() => handleFolderClick(folder.id)}>
                <div className="flex items-center space-x-3">
                  <Folder className="h-4 w-4 text-blue-500" aria-label="Folder" />
                  <h3 className="text-lg font-semibold">{folder.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {folder.description}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 data-[state=open]:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleOpenEditFolderDialog(folder)}>
                    Edit folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteFolder(folder.id)}
                  >
                    Delete folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Bookmark List */}
      {bookmarks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="rounded-md border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <LinkIcon className="h-4 w-4 text-gray-500" aria-label="Link" />
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold hover:underline truncate"
                >
                  {bookmark.title}
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {bookmark.description}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 data-[state=open]:bg-muted"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  >
                    Delete bookmark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {folders.length === 0 && bookmarks.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">
            No folders or bookmarks here
          </h3>
          <p className="text-muted-foreground">
            Add new folders and bookmarks to organize your links.
          </p>
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Add a new folder to organize your bookmarks.
            </DialogDescription>
          </DialogHeader>
          <Form {...folderForm}>
            <form onSubmit={folderForm.handleSubmit(handleCreateFolder)} className="space-y-4">
              <FormField
                control={folderForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Folder Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={folderForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Folder Description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={folderForm.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Folder</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCreateFolderDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Bookmark Dialog */}
      <Dialog open={isCreateBookmarkDialogOpen} onOpenChange={setIsCreateBookmarkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Bookmark</DialogTitle>
            <DialogDescription>
              Add a new bookmark to your collection.
            </DialogDescription>
          </DialogHeader>
          <Form {...bookmarkForm}>
            <form onSubmit={bookmarkForm.handleSubmit(handleCreateBookmark)} className="space-y-4">
              <FormField
                control={bookmarkForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Bookmark Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bookmarkForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={bookmarkForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bookmark Description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={bookmarkForm.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Bookmark</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseCreateBookmarkDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={isEditFolderDialogOpen} onOpenChange={setIsEditFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogDescription>
              Edit the details of the selected folder.
            </DialogDescription>
          </DialogHeader>
          <Form {...editFolderForm}>
            <form onSubmit={editFolderForm.handleSubmit(handleEditFolder)} className="space-y-4">
              <FormField
                control={editFolderForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Folder Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editFolderForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Folder Description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={editFolderForm.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Private Folder</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEditFolderDialog}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Bookmark Confirmation Dialog */}
      <AlertDialog open={selectedBookmarkId !== null} onOpenChange={setSelectedBookmarkId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              bookmark from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBookmarkId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBookmark}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={selectedFolderId !== null} onOpenChange={setSelectedFolderId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              folder and all its contents from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFolderId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFolder}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { BookmarksContent };
