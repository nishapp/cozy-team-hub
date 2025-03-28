
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Post } from "@/types/post";
import ConvertToBitDialog from "@/components/posts/ConvertToBitDialog";

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch the post from the database
    // For now, use sample data from the Posts page
    import("@/pages/Posts").then((module) => {
      const samplePosts: Post[] = module.default().props.children[1].props.children[2].props.posts;
      const foundPost = samplePosts.find(p => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
      }
      setLoading(false);
    });
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/posts')}
              className="h-8 w-8"
            >
              <ArrowLeft size={18} />
            </Button>
          </div>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/posts')}>
              Back to Posts
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/posts')}
              className="h-8 w-8"
            >
              <ArrowLeft size={18} />
            </Button>
          </div>
          
          <article className="max-w-3xl mx-auto">
            {post.image_url && (
              <div className="mb-6">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-[300px] md:h-[400px] object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags?.map((tag, index) => (
                  <span key={index} className="bg-muted px-2 py-1 rounded-md text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {post.created_at !== post.updated_at && ' (updated)'}
              </div>
            </div>
            
            <div className="prose max-w-none dark:prose-invert prose-img:rounded-lg" 
                 dangerouslySetInnerHTML={{ __html: post.content }} />
              
            <div className="mt-12 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/posts')}
              >
                Back to Posts
              </Button>
              <Button onClick={() => setIsConvertDialogOpen(true)}>
                Convert to Bit
              </Button>
            </div>
          </article>
          
          {post && (
            <ConvertToBitDialog
              post={post}
              isOpen={isConvertDialogOpen}
              onClose={() => setIsConvertDialogOpen(false)}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default PostDetail;
