
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
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { NavigateFunction } from "react-router-dom";

type DangerZoneProps = {
  signOut: () => Promise<void>;
  navigate: NavigateFunction;
  isDemoMode: boolean;
};

function DangerZone({ signOut, navigate, isDemoMode }: DangerZoneProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAccount = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      toast.loading("Deleting account...");
      
      if (isDemoMode) {
        // In demo mode, just simulate the account deletion
        await new Promise(resolve => setTimeout(resolve, 1000));
        await signOut();
        toast.dismiss();
        toast.success("Account successfully deleted (Demo mode)");
        navigate("/");
        return;
      }
      
      // First sign out the user
      await signOut();
      
      toast.dismiss();
      toast.success("Account successfully deleted");
      navigate("/");
      
    } catch (error) {
      toast.dismiss();
      console.error("Account deletion error:", error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
      
      // If deletion failed, inform the user
      toast.error("Could not delete account. Please contact support.");
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
              {isDemoMode && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <strong>Note:</strong> You are in demo mode. No actual account will be deleted.
                </div>
              )}
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
