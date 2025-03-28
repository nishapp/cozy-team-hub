
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

// Sample posts for demo
const samplePosts = [
  {
    id: "1",
    title: "Learning TypeScript",
    content: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds additional syntax to JavaScript to support a tighter integration with your editor. This results in a more robust codebase and helps catch errors early.\n\nSome key features of TypeScript include:\n- Static typing\n- Type inference\n- Interfaces\n- Generics\n- Decorators",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    content: "React Hooks are functions that let you 'hook into' React state and lifecycle features from function components.\n\nCommon hooks include:\n- useState: Adds state to functional components\n- useEffect: Handles side effects in functional components\n- useContext: Subscribes to React context\n- useRef: Creates a mutable reference\n- useMemo & useCallback: Optimize performance by memoizing values and functions",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const Posts = () => {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, we would fetch posts from the database here
    // For now, we'll use the sample posts
  }, [user]);

  const handleCreatePost = (newPost: Post) => {
    const postWithId = {
      ...newPost,
      id: newPost.id || `post-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setPosts([postWithId, ...posts]);
    toast.success("Post created successfully!");
    setIsCreateModalOpen(false);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? { ...updatedPost, updated_at: new Date().toISOString() } : post
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

  if (authLoading) {
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
          
          <PostsList 
            posts={posts} 
            onEditPost={setSelectedPost} 
            onDeletePost={handleDeletePost} 
          />
          
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
