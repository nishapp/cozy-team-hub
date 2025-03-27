
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
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

const DangerZone = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      // Call the delete_user function with no parameters
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      await signOut();
      navigate("/auth", { replace: true });
      toast.success("Your account has been deleted successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred while deleting your account");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-6">Danger Zone</h2>
      
      <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex items-start space-x-4">
            <div className="bg-destructive/10 p-2 rounded">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="pl-11">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DangerZone;
