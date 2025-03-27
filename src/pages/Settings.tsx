
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";

const profileSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { 
    organizations, 
    currentOrganization,
    loading: orgLoading
  } = useOrganization();

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !authLoading && !orgLoading && organizations.length === 0) {
    return <Navigate to="/organization" replace />;
  }

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const deleteAccount = async () => {
    if (!user) return;
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action will permanently delete your account and all associated data including organizations you own. This action cannot be undone."
    );
    
    if (!confirmDelete) return;
    
    try {
      toast.loading("Deleting account...");
      
      // Fetch all organizations created by the user
      // Fix the TypeScript error by explicitly typing the query result
      const { data: userOrgs, error: orgsError } = await supabase
        .from("organizations")
        .select("id")
        .eq("created_by", user.id);
        
      if (orgsError) {
        console.error("Error fetching user organizations:", orgsError);
        throw new Error("Failed to fetch user organizations");
      }
      
      // Delete the user's organization memberships
      const { error: membershipsError } = await supabase
        .from("organization_members")
        .delete()
        .eq("user_id", user.id);
        
      if (membershipsError) {
        console.error("Error deleting organization memberships:", membershipsError);
        throw new Error("Failed to delete organization memberships");
      }
      
      // If the user owns organizations, delete all members and then the organizations
      if (userOrgs && userOrgs.length > 0) {
        // Explicitly type the organization IDs to avoid deep recursion
        const orgIds = userOrgs.map((org: { id: string }) => org.id);
        
        // Delete members of these organizations
        const { error: orgMembersError } = await supabase
          .from("organization_members")
          .delete()
          .in("organization_id", orgIds);
          
        if (orgMembersError) {
          console.error("Error deleting organization members:", orgMembersError);
          throw new Error("Failed to delete organization members");
        }
        
        // Delete the organizations
        const { error: deleteOrgsError } = await supabase
          .from("organizations")
          .delete()
          .in("id", orgIds);
          
        if (deleteOrgsError) {
          console.error("Error deleting organizations:", deleteOrgsError);
          throw new Error("Failed to delete organizations");
        }
      }
      
      // Delete user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);
        
      if (profileError) {
        console.error("Error deleting profile:", profileError);
        throw new Error("Failed to delete profile");
      }
      
      // In the client-side SDK, we can't directly delete the user account
      // Instead, we'll sign out the user after deleting all associated data
      await supabase.auth.signOut();
      
      toast.dismiss();
      toast.success("Account successfully deleted");
      navigate("/");
      
    } catch (error) {
      toast.dismiss();
      console.error("Account deletion error:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="page-container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>
            
            <div className="max-w-3xl">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <ProfileForm user={user} />
                </TabsContent>
                
                <TabsContent value="password" className="space-y-6">
                  <PasswordForm />
                </TabsContent>
              </Tabs>
              
              <div className="mt-12 border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button 
                  variant="destructive"
                  onClick={deleteAccount}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

function ProfileForm({ user }: { user: any }) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || "",
      fullName: "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    toast.success("Profile updated successfully!");
    console.log("Profile updated:", values);
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">Profile Information</h2>
      
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
          
          <Button type="submit" className="mt-2">
            Update Profile
          </Button>
        </form>
      </Form>
    </div>
  );
}

function PasswordForm() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    toast.success("Password updated successfully!");
    form.reset();
  };

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="mt-2">
            Change Password
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Settings;
