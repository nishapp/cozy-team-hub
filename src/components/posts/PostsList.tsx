
import React from "react";
import { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2, Sparkles } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ConvertToBitDialog from "./ConvertToBitDialog";

interface PostsListProps {
  posts: Post[];
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

const PostsList = ({ posts, onEditPost, onDeletePost }: PostsListProps) => {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  const handleConvertToBit = (post: Post) => {
    setSelectedPost(post);
    setIsConvertDialogOpen(true);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">
          You haven't created any posts yet.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first post to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="group">
          <CardHeader className="relative pb-2">
            {post.image_url && (
              <div className="w-full h-40 mb-2 overflow-hidden rounded-md">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <CardTitle className="line-clamp-2">{post.title}</CardTitle>
            <CardDescription>
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
              })}
              {post.created_at !== post.updated_at && " (edited)"}
            </CardDescription>
            {post.category && (
              <Badge variant="outline" className="absolute top-3 right-3 bg-background/80">
                {post.category}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pb-2">
            <div 
              className="text-sm text-muted-foreground line-clamp-3 min-h-[3em]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground"
                onClick={() => onEditPost(post)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeletePost(post.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleConvertToBit(post)}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Convert to Bit
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {selectedPost && (
        <ConvertToBitDialog
          post={selectedPost}
          isOpen={isConvertDialogOpen}
          onClose={() => setIsConvertDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default PostsList;
