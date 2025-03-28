
import React, { memo } from "react";
import { Post } from "@/types/post";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Pencil, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import ConvertToBitDialog from "./ConvertToBitDialog";

interface PostsListProps {
  posts: Post[];
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
}

// Using React.memo to prevent unnecessary re-renders
const PostsList: React.FC<PostsListProps> = memo(({ posts, onEditPost, onDeletePost }) => {
  const [postToConvert, setPostToConvert] = React.useState<Post | null>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <Link to={`/post/${post.id}`} className="hover:underline">
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal size={16} />
                    <span className="sr-only">Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditPost(post)}>
                    <Pencil className="mr-2" size={14} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPostToConvert(post)}>
                    <ExternalLink className="mr-2" size={14} />
                    Convert to Bit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeletePost(post.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2" size={14} />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="pt-2">
              {formatDate(post.created_at)}
              {post.tags && post.tags.length > 0 && (
                <span className="ml-2">
                  • {post.tags.slice(0, 3).join(', ')}
                  {post.tags.length > 3 && '...'}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Link to={`/post/${post.id}`} className="block h-full">
              {post.image_url ? (
                <div className="relative h-40 mb-3">
                  <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                </div>
              ) : null}
              <div 
                className="line-clamp-4 text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: post.content
                }}
              />
            </Link>
          </CardContent>
          <CardFooter className="pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              asChild
            >
              <Link to={`/post/${post.id}`}>
                Read More
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {postToConvert && (
        <ConvertToBitDialog
          post={postToConvert}
          isOpen={!!postToConvert}
          onClose={() => setPostToConvert(null)}
        />
      )}
    </div>
  );
});

PostsList.displayName = "PostsList";

export default PostsList;
