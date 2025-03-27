
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileForm() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: "",
      avatarUrl: "",
    },
  });

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.setValue('fullName', data.full_name || '');
          form.setValue('avatarUrl', data.avatar_url || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: values.fullName,
          avatar_url: values.avatarUrl,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('') || user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">Profile Information</h2>
      
      <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start sm:space-x-4">
        <Avatar className="h-20 w-20 mb-4 sm:mb-0">
          <AvatarImage src={form.watch('avatarUrl')} alt="Profile" />
          <AvatarFallback>{getInitials(form.watch('fullName'))}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="mt-2" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
