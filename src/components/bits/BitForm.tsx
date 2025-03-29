import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/lib/supabase";
import { Loader2, Bookmark, BookmarkCheck, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { fetchWebpageSummary } from "@/lib/api";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.string().transform(val => val ? val.split(",").map(tag => tag.trim()) : []),
  category: z.string().min(1, "Category is required"),
  visibility: z.string().min(1, "Visibility is required"),
  wdylt_comment: z.string().optional(),
  image_url: z.string().optional(),
  link: z.string().optional(),
  bookmarked: z.boolean().default(false),
});

interface BitFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const BitForm: React.FC<BitFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const { uploadImage } = useImageUpload();
  const { user } = useAuth();

  const processInitialData = () => {
    if (!initialData) return {};
    
    const processed = { ...initialData };
    
    if (processed.tags) {
      if (Array.isArray(processed.tags)) {
        processed.tags = processed.tags.join(", ");
      } else {
        processed.tags = "";
      }
    }
    
    return processed;
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      category: "",
      visibility: "public",
      wdylt_comment: "",
      image_url: "",
      link: "",
      bookmarked: false,
      ...processInitialData()
    },
  });

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleGenerateSummary = async () => {
    const url = form.getValues("link");
    
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }
    
    if (!isValidUrl(url)) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setSummarizing(true);
    try {
      const summary = await fetchWebpageSummary(url);
      
      form.setValue("description", summary);
      
      if (!form.getValues("title")) {
        try {
          const urlObj = new URL(url);
          const domain = urlObj.hostname.replace('www.', '');
          const pathSegments = urlObj.pathname.split('/').filter(Boolean);
          const pageTitle = pathSegments.length > 0 
            ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\.(html|php|aspx)$/, '')
            : domain;
          
          form.setValue("title", pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1));
        } catch (error) {
          console.error("Error generating title from URL:", error);
        }
      }
      
      if (!form.getValues("tags")) {
        try {
          const urlObj = new URL(url);
          const domain = urlObj.hostname.replace('www.', '').split('.')[0];
          form.setValue("tags", domain);
        } catch (error) {
          console.error("Error generating tags from URL:", error);
        }
      }
      
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setSummarizing(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, user.id);
      if (imageUrl) {
        form.setValue("image_url", imageUrl);
      }
    } catch (error) {
      console.error("Image upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmitHandler = async (values: z.infer<typeof formSchema>) => {
    if (values.bookmarked && user) {
      try {
        const bookmark = {
          id: crypto.randomUUID(),
          title: values.title,
          url: values.link || "",
          isPublic: values.visibility === "public",
          folderId: "bits",
          createdAt: new Date().toISOString(),
        };
        
        const existingBookmarksString = localStorage.getItem('wdylt_bookmarks') || '[]';
        const existingBookmarks = JSON.parse(existingBookmarksString);
        
        const updatedBookmarks = [bookmark, ...existingBookmarks];
        localStorage.setItem('wdylt_bookmarks', JSON.stringify(updatedBookmarks));
        
        const bookmarkIdsString = localStorage.getItem('bookmarkedBits') || '[]';
        const bookmarkIds = JSON.parse(bookmarkIdsString);
        localStorage.setItem('bookmarkedBits', JSON.stringify([...bookmarkIds, values.title]));
        
        toast.success("Bit saved to bookmarks!");
      } catch (error) {
        console.error("Error saving to bookmarks:", error);
      }
    }
    
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="My Amazing Bit" {...field} />
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
                  placeholder="What is this bit about?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL / Link</FormLabel>
              <div className="flex space-x-2">
                <div className="flex-grow relative">
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <LinkIcon size={16} />
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com" 
                      type="url" 
                      className="pl-8"
                      {...field} 
                    />
                  </FormControl>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  title="Open URL"
                  className="flex-shrink-0"
                  onClick={() => {
                    const url = form.getValues("link");
                    if (url && isValidUrl(url)) {
                      window.open(url, '_blank');
                    }
                  }}
                  disabled={!form.getValues("link") || !isValidUrl(form.getValues("link"))}
                >
                  <ExternalLink size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex-shrink-0 whitespace-nowrap"
                  onClick={handleGenerateSummary}
                  disabled={summarizing || !form.getValues("link") || !isValidUrl(form.getValues("link"))}
                >
                  {summarizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    "Generate Summary"
                  )}
                </Button>
              </div>
              <FormDescription>
                Add a URL that relates to this bit. Click "Generate Summary" to automatically create a description.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="react, javascript, coding" {...field} />
              </FormControl>
              <FormDescription>
                Separate tags with commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="hobbies">Hobbies</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <FormField
          control={form.control}
          name="wdylt_comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What did you learn today? (Comment)</FormLabel>
              <FormControl>
                <Input placeholder="Today I learned..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image_url"
          render={() => (
            <FormItem>
              <FormLabel>Image Upload</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                />
              </FormControl>
              {uploading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
              {form.getValues("image_url") && (
                <img
                  src={form.getValues("image_url")}
                  alt="Uploaded"
                  className="mt-2 rounded-md object-cover"
                  style={{ maxHeight: '100px', maxWidth: '100%' }}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bookmarked"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="bookmark-checkbox"
                    className="sr-only"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <label
                    htmlFor="bookmark-checkbox"
                    className={`flex items-center cursor-pointer p-2 rounded-md ${field.value ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {field.value ? (
                      <BookmarkCheck className="h-5 w-5 mr-2" />
                    ) : (
                      <Bookmark className="h-5 w-5 mr-2" />
                    )}
                    <span>Save to bookmarks</span>
                  </label>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default BitForm;
