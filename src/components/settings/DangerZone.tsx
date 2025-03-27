
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShieldAlert, UserX, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DangerZone = () => {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isCheckingSuspension, setIsCheckingSuspension] = useState(true);
  
  // Check if user is suspended
  useEffect(() => {
    const checkSuspensionStatus = async () => {
      if (!user) return;
      
      try {
        setIsCheckingSuspension(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('is_suspended')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setIsSuspended(data.is_suspended);
      } catch (error) {
        console.error('Error checking suspension status:', error);
      } finally {
        setIsCheckingSuspension(false);
      }
    };
    
    checkSuspensionStatus();
  }, [user]);
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      // Call the delete_user function
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      // Sign out the user
      await signOut();
      
      toast.success("Your account has been deleted");
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isCheckingSuspension) {
    return <div className="p-8 animate-pulse">Loading...</div>;
  }
  
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-6 flex items-center">
        <ShieldAlert className="h-5 w-5 mr-2 text-destructive" />
        Danger Zone
      </h2>
      
      {isSuspended && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your account has been suspended by an administrator. Some actions may be restricted.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-destructive">
            <UserX className="h-5 w-5 mr-2" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all of your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This action is irreversible. Once you delete your account, all of your data will be permanently removed.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isSuspended}>
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DangerZone;
