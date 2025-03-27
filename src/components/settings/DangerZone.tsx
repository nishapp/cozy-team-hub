import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DangerZone = () => {
  const { signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirmation flow state
  const [showConfirmation, setShowConfirmation] = useState(false);

  const initiateDelete = () => {
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  const deleteAccount = async () => {
    try {
      // Call the RPC function with an empty object as parameter
      const { error } = await supabase.rpc('delete_user', {});
      
      if (error) throw error;
      
      // Handle successful deletion
      signOut();
      toast.success("Your account has been deleted");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Danger Zone</h2>
      <p className="text-sm text-muted-foreground">
        Be careful, actions in this section are irreversible.
      </p>

      {/* Delete Account Section */}
      <div className="rounded-md border p-4">
        <h3 className="text-sm font-medium">Delete Account</h3>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        {!showConfirmation ? (
          <Button
            variant="destructive"
            onClick={initiateDelete}
            disabled={isDeleting}
            className="mt-4"
          >
            Delete Account
          </Button>
        ) : (
          <div className="flex items-center space-x-4 mt-4">
            <Button variant="ghost" onClick={cancelDelete} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DangerZone;
