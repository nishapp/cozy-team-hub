
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type UseImageUploadReturn = {
  uploading: boolean;
  uploadImage: (file: File, userId: string) => Promise<string | null>;
  deleteImage: (imagePath: string) => Promise<boolean>;
};

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false);
  
  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('File must be an image');
        return null;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return null;
      }
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const deleteImage = async (imagePath: string): Promise<boolean> => {
    try {
      // Extract the file path from the public URL
      const storagePath = imagePath.split('profile_images/')[1];
      
      if (!storagePath) return false;
      
      const { error } = await supabase.storage
        .from('profile_images')
        .remove([storagePath]);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };
  
  return { uploading, uploadImage, deleteImage };
};
