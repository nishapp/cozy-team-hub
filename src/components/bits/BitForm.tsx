
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Image, X } from "lucide-react";

// Define the Bit type
interface Bit {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at?: string;
}

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  tags: z.string().transform((val) => val.split(",").map((tag) => tag.trim()).filter(Boolean)),
  category: z.string(),
  visibility: z.string(),
  wdylt_comment: z.string().optional(),
});

interface BitFormProps {
  onSubmit: (data: Bit) => void;
  initialData?: Bit;
  onCancel?: () => void;
}

const BitForm: React.FC<BitFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { uploading, uploadImage, deleteImage } = useImageUpload();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      tags: initialData?.tags ? initialData.tags.join(", ") : "",
      category: initialData?.category || "coding",
      visibility: initialData?.visibility || "public",
      wdylt_comment: initialData?.wdylt_comment || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setImageFile(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("You must be logged in to add or edit bits");
      return;
    }

    let imageUrl = initialData?.image_url;

    if (imageFile) {
      try {
        if (initialData?.image_url && initialData.image_url !== imagePreview) {
          await deleteImage(initialData.image_url);
        }
        
        imageUrl = await uploadImage(imageFile, user.id);
        
        if (!imageUrl) {
          toast.error("Failed to upload image");
          return;
        }
      } catch (error) {
        console.error("Error handling image:", error);
        toast.error("Error handling image");
        return;
      }
    } else if (imagePreview === null && initialData?.image_url) {
      await deleteImage(initialData.image_url);
      imageUrl = undefined;
    }

    const bitData: Bit = {
      ...initialData,
      title: values.title,
      description: values.description,
      tags: values.tags,
      category: values.category,
      visibility: values.visibility,
      wdylt_comment: values.wdylt_comment,
      image_url: imageUrl,
    };

    onSubmit(bitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What's this bit about?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Share the details..." 
                  className="min-h-[120px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="programming, design, tutorial..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="hobbies">Hobbies</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="wdylt_comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What Did You Learn Today? (WDYLT)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What was your key takeaway?" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel htmlFor="image-upload">Image (optional)</FormLabel>
          <div className="flex flex-col gap-4">
            <Input 
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="cursor-pointer"
            />
            
            {imagePreview && (
              <div className="relative w-full max-w-[300px] rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-auto object-cover rounded-md" 
                />
                <Button 
                  type="button"
                  variant="destructive" 
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeImage}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button 
            type="submit"
            disabled={uploading || form.formState.isSubmitting}
          >
            {uploading ? "Uploading..." : initialData ? "Update Bit" : "Add Bit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BitForm;
