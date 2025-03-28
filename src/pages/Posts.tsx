
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import PostsList from "@/components/posts/PostsList";
import { Post } from "@/types/post";
import CreatePostModal from "@/components/posts/CreatePostModal";
import { toast } from "sonner";
import { samplePosts } from "@/data/samplePosts";

const Posts = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load posts with a small delay to prevent any potential race conditions
    const timer = setTimeout(() => {
      setPosts(samplePosts);
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleCreatePost = (newPost: Post) => {
    const postWithId = {
      ...newPost,
      id: newPost.id || `post-${Date.now()}`,
    };
    
    setPosts([postWithId, ...posts]);
    toast.success("Post created successfully!");
    setIsCreateModalOpen(false);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    toast.success("Post updated successfully!");
    setSelectedPost(null);
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    toast.success("Post deleted successfully!");
  };

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-3xl font-bold">My Posts</h1>
              <span className="text-muted-foreground">{posts.length} Posts</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-muted-foreground">
                Create and manage your long-form content before turning it into bits.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1">
                <Plus size={16} />
                New Post
              </Button>
            </div>
          </div>
          
          {posts.length > 0 ? (
            <PostsList 
              posts={posts} 
              onEditPost={setSelectedPost} 
              onDeletePost={handleDeletePost} 
            />
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first post to get started.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="gap-1">
                <Plus size={16} />
                Create Post
              </Button>
            </div>
          )}
          
          <CreatePostModal 
            isOpen={isCreateModalOpen || !!selectedPost} 
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedPost(null);
            }}
            onSave={selectedPost ? handleUpdatePost : handleCreatePost}
            post={selectedPost}
          />
        </main>
      </div>
    </PageTransition>
  );
};

export default Posts;
