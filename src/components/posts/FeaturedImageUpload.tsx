
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/context/AuthContext";

interface FeaturedImageUploadProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const FeaturedImageUpload = ({ imageUrl, setImageUrl }: FeaturedImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { uploadImage } = useImageUpload();
  const { user } = useAuth();

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
  );
};

export default FeaturedImageUpload;
