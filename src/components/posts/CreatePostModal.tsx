
import { useState, useEffect } from "react";
import { Post } from "@/types/post";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FeaturedImageUpload from "./FeaturedImageUpload";
import PostFormFields from "./PostFormFields";

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

  // Reset state when modal opens/closes or post changes
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
  }, [post, isOpen]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {post ? "Make changes to your post" : "Create a new post to share your thoughts"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <PostFormFields 
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            tags={tags}
            setTags={setTags}
            category={category}
            setCategory={setCategory}
          />

          <FeaturedImageUpload 
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
          />
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
