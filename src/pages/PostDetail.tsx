
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Heart, MessageSquare } from "lucide-react";
import { samplePosts } from "@/data/samplePosts";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import PageTransition from "@/components/ui/PageTransition";
import { toast } from "sonner";
import ConvertToBitDialog from "@/components/posts/ConvertToBitDialog";
import CreateBookmarkFromPost from "@/components/bookmarks/CreateBookmarkFromPost";
import SocialShare from "@/components/share/SocialShare";
import OpenGraphHead from "@/components/share/OpenGraphHead";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch the post from the API
    // For now, we'll use a sample post
    const foundPost = samplePosts.find((p) => p.id === postId);
    
    if (foundPost) {
      setPost(foundPost);
    } else {
      toast.error("Post not found");
    }
    
    setLoading(false);
  }, [postId]);

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? "Removed like" : "Post liked!");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button onClick={handleGoBack}>Go Back</Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <OpenGraphHead 
        title={post.title}
        description={post.content?.substring(0, 160) || "Check out this post"}
        imageUrl={post.image_url || "/og-image.png"}
        type="article"
      />
      
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src="/avatar-placeholder.png" />
                  <AvatarFallback>
                    {post.author?.substring(0, 2) || "AN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{post.author || "Anonymous"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.created_at
                      ? formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })
                      : "Unknown date"}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <SocialShare 
                  title={post.title} 
                  description={post.content?.substring(0, 160)} 
                  hashtags={post.tags} 
                />
                <CreateBookmarkFromPost post={post} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsConvertDialogOpen(true)}
                >
                  Convert to Bit
                </Button>
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-6 mb-4">{post.title}</h1>

            {post.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "400px" }}
                />
              </div>
            )}

            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags &&
                post.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
            </div>

            <div className="flex items-center space-x-4 mt-8 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${
                  liked ? "text-red-500" : ""
                }`}
                onClick={handleLike}
              >
                <Heart
                  className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`}
                />
                <span>Like</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Comment</span>
              </Button>
              
              <div className="ml-auto">
                <SocialShare 
                  title={post.title} 
                  description={post.content?.substring(0, 160)} 
                  hashtags={post.tags} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments section would go here */}
        
        {isConvertDialogOpen && (
          <ConvertToBitDialog
            post={post}
            isOpen={isConvertDialogOpen}
            onClose={() => setIsConvertDialogOpen(false)}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default PostDetail;
