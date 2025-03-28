
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import RichTextEditor from "../editor/RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  post?: Post | null;
}

const CreatePostModal = ({
  isOpen,
  onClose,
  onSave,
  post,
}: CreatePostModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const { user } = useAuth();

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags ? post.tags.join(", ") : "");
      setCategory(post.category || "");
      setImageUrl(post.image_url || "");
    } else {
      setTitle("");
      setContent("");
      setTags("");
      setCategory("");
      setImageUrl("");
    }
  }, [post]);

  const handleSave = () => {
    const tagsArray = tags
      ? tags.split(",").map((tag) => tag.trim().toLowerCase())
      : [];

    const updatedPost: Post = {
      id: post?.id || "",
      title,
      content,
      tags: tagsArray,
      category,
      image_url: imageUrl,
      created_at: post?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSave(updatedPost);
  };

  const handleFeaturedImageUpload = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, user.id);
      if (url) {
        setImageUrl(url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="tag1, tag2, tag3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate tags with commas</p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="hobbies">Hobbies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Featured Image Upload */}
          <div className="grid gap-2">
            <Label>Featured Image</Label>
            <div className="border rounded-md p-4 flex flex-col items-center justify-center">
              {imageUrl ? (
                <div className="space-y-2 w-full">
                  <img 
                    src={imageUrl} 
                    alt="Featured" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setImageUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4 text-muted-foreground text-sm">
                    We recommend uploading or dragging in an image that is 1920x1080 pixels
                  </div>
                  <Button
                    variant="outline"
                    disabled={uploading}
                    className="relative"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>Upload from computer</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFeaturedImageUpload(e.target.files[0]);
                        }
                      }}
                      disabled={uploading}
                    />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <RichTextEditor 
              value={content} 
              onChange={setContent}
              placeholder="Write your post content here..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title || !content}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
