
import React, { useState } from "react";
import { sampleFriends } from "@/data/sampleFriends";
import { initialBookmarksData } from "@/data/initialBookmarks";
import { BookmarkItem } from "@/types/bookmark";
import { Input } from "@/components/ui/input";
import { Search, Link as LinkIcon, ExternalLink, FileCode, BookmarkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BitForm from "@/components/bits/BitForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const getPublicBookmarks = () => {
  const friendBookmarks: {
    friendId: string;
    friendName: string;
    friendAvatar?: string;
    bookmark: BookmarkItem;
    folderName?: string;
  }[] = [];
  
  sampleFriends.forEach((friend, index) => {
    initialBookmarksData.folders.forEach(folder => {
      if (!folder.isPrivate) {
        folder.bookmarks
          .filter(bookmark => !bookmark.isPrivate)
          .forEach((bookmark, bIndex) => {
            if ((bIndex + index) % sampleFriends.length === index) {
              friendBookmarks.push({
                friendId: friend.id,
                friendName: friend.name,
                friendAvatar: friend.image, // Change from profilePicture to image
                bookmark,
                folderName: folder.name
              });
            }
          });
      }
    });
    
    initialBookmarksData.rootBookmarks
      .filter(bookmark => !bookmark.isPrivate)
      .forEach((bookmark, bIndex) => {
        if ((bIndex + index) % sampleFriends.length === index) {
          friendBookmarks.push({
            friendId: friend.id,
            friendName: friend.name,
            friendAvatar: friend.image, // Change from profilePicture to image
            bookmark
          });
        }
      });
  });
  
  return friendBookmarks;
};

const FriendBookmarks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<string>("all");
  const [friendBookmarks, setFriendBookmarks] = useState(getPublicBookmarks());
  const [isCreateBitOpen, setIsCreateBitOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  
  const filteredBookmarks = friendBookmarks.filter(item => {
    const matchesSearch = 
      item.bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.friendName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.folderName && item.folderName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFriend = selectedFriend === "all" || item.friendId === selectedFriend;
    
    return matchesSearch && matchesFriend;
  });
  
  const handleCreateBit = (bookmark: BookmarkItem) => {
    setSelectedBookmark(bookmark);
    setIsCreateBitOpen(true);
  };

  const handleBitSubmit = (bitData: any) => {
    toast.success("Bit created successfully from bookmark!");
    setIsCreateBitOpen(false);
    setSelectedBookmark(null);
  };

  const getInitialBitData = () => {
    if (!selectedBookmark) return {};
    
    return {
      title: selectedBookmark.title,
      description: selectedBookmark.description || "",
      link: selectedBookmark.url,
      tags: [],
      category: "bookmarks",
      visibility: "public",
    };
  };
  
  const uniqueFriends = Array.from(
    new Set(friendBookmarks.map(item => item.friendId))
  ).map(friendId => {
    const friendItem = friendBookmarks.find(item => item.friendId === friendId);
    return {
      id: friendId,
      name: friendItem?.friendName || "",
      avatar: friendItem?.friendAvatar
    };
  });

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search buddy bookmarks..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedFriend} onValueChange={setSelectedFriend}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by buddy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buddies</SelectItem>
                {uniqueFriends.map(friend => (
                  <SelectItem key={friend.id} value={friend.id || "unknown"}>
                    {friend.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookmarks found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedFriend !== "all"
                ? "Try adjusting your search or filter."
                : "Your buddies haven't shared any public bookmarks yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookmarks.map((item, index) => (
              <Card key={`${item.friendId}-${item.bookmark.id}-${index}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-center flex-1">
                    <div className="h-5 w-5 mr-2 flex-shrink-0">
                      {item.bookmark.icon ? (
                        <img
                          src={item.bookmark.icon}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <LinkIcon className="h-full w-full text-blue-500" />
                      )}
                    </div>
                    <CardTitle className="text-base truncate">
                      {item.bookmark.title}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <a
                            href={item.bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">Open link</span>
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open link in new tab</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCreateBit(item.bookmark)}
                        >
                          <FileCode className="h-4 w-4" />
                          <span className="sr-only">Create Bit</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create Bit from Bookmark</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {item.bookmark.description || (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {item.bookmark.url}
                  </p>
                  {item.folderName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Folder:</span> {item.folderName}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="pt-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={item.friendAvatar} alt={item.friendName} />
                      <AvatarFallback>
                        {item.friendName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Shared by <span className="font-medium">{item.friendName}</span>
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <Dialog open={isCreateBitOpen} onOpenChange={setIsCreateBitOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Bit from Bookmark</DialogTitle>
              <DialogDescription>
                Use this bookmark to create a new bit. You can customize the details below.
              </DialogDescription>
            </DialogHeader>
            
            <BitForm 
              onSubmit={handleBitSubmit} 
              onCancel={() => setIsCreateBitOpen(false)} 
              initialData={getInitialBitData()}
            />
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default FriendBookmarks;
