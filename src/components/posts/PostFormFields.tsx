
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RichTextEditor from "../editor/RichTextEditor";

interface PostFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  category: string;
  setCategory: (category: string) => void;
}

const PostFormFields = ({
  title,
  setTitle,
  content,
  setContent,
  tags,
  setTags,
  category,
  setCategory,
}: PostFormFieldsProps) => {
  return (
    <>
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

      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <RichTextEditor 
          value={content} 
          onChange={setContent}
          placeholder="Write your post content here..."
        />
      </div>
    </>
  );
};

export default PostFormFields;
