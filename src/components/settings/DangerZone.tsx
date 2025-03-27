
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase, isDemoMode } from "../../lib/supabase";
import { toast } from "sonner";
import { NavigateFunction } from "react-router-dom";

type DangerZoneProps = {
  signOut: () => Promise<void>;
  navigate: NavigateFunction;
};

function DangerZone({ signOut, navigate }: DangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      toast.loading("Deleting account...");
      
      // First get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No authenticated user found");
      }
      
      if (isDemoMode) {
        // In demo mode, simulate account deletion without actually deleting
        toast.success("Demo mode: Account would be deleted in production");
        await signOut();
        navigate("/");
        return;
      }
      
      // Delete the user's profile data first (due to foreign key constraints)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
        
      if (profileError) {
        console.error("Profile deletion error:", profileError);
        // Continue anyway as we want to try to delete the user account
      }
      
      // Delete the user's auth account using the Supabase API
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        throw authError;
      }
      
      // Sign out the user
      await signOut();
      
      toast.dismiss();
      toast.success("Account successfully deleted");
      navigate("/");
      
    } catch (error) {
      toast.dismiss();
      console.error("Account deletion error:", error);
      
      if (error instanceof Error && error.message.includes("not_admin")) {
        // If we hit a permission issue, we'll go with the sign out approach instead
        toast.error("Cannot delete account with current permissions. Please contact support.");
        
        // Still sign out the user to end their session
        await signOut();
        navigate("/");
      } else {
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-12 border-t pt-6">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Permanently delete your account and all associated data
      </p>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DangerZone;
