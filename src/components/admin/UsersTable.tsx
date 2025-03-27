
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, UserX, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import ProfileAvatar from "@/components/ui/ProfileAvatar";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  role: 'admin' | 'user';
  is_suspended: boolean;
};

const UsersTable = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || "Failed to fetch users");
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Suspend/Unsuspend user
  const toggleSuspendUser = async (userId: string, currentStatus: boolean) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(userId);
      
      const { error } = await supabase.rpc('suspend_user', { 
        user_id: userId,
        suspend: !currentStatus
      });
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, is_suspended: !currentStatus };
        }
        return user;
      }));
      
      toast.success(currentStatus ? "User has been unsuspended" : "User has been suspended");
    } catch (error: any) {
      console.error('Error toggling user suspension:', error);
      toast.error(error.message || "Failed to update user status");
    } finally {
      setActionInProgress(null);
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(userId);
      
      if (isCurrentlyAdmin) {
        const { error } = await supabase.rpc('demote_to_user', { user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('promote_to_admin', { user_id: userId });
        if (error) throw error;
      }
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return { ...user, role: isCurrentlyAdmin ? 'user' : 'admin' };
        }
        return user;
      }));
      
      toast.success(isCurrentlyAdmin 
        ? "User has been demoted to regular user" 
        : "User has been promoted to admin");
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast.error(error.message || "Failed to update user role");
    } finally {
      setActionInProgress(null);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(userId);
      
      const { error } = await supabase.rpc('admin_delete_user', { user_id: userId });
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      toast.success("User has been deleted");
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchUsers}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} className={user.is_suspended ? "opacity-60" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <ProfileAvatar 
                      src={user.avatar_url} 
                      fallbackText={user.full_name}
                      size="sm"
                    />
                    <span>{user.full_name || "Unnamed User"}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.is_suspended ? "destructive" : "success"}>
                    {user.is_suspended ? 'Suspended' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Skip actions on current user */}
                    {currentUser?.id !== user.id && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSuspendUser(user.id, user.is_suspended)}
                          disabled={actionInProgress === user.id}
                          title={user.is_suspended ? "Unsuspend User" : "Suspend User"}
                        >
                          {actionInProgress === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.is_suspended ? (
                            <UserCheck className="h-4 w-4" />
                          ) : (
                            <UserX className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleAdminStatus(user.id, user.role === 'admin')}
                          disabled={actionInProgress === user.id}
                          title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                        >
                          {actionInProgress === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive border-destructive hover:bg-destructive/10"
                              disabled={actionInProgress === user.id}
                              title="Delete User"
                            >
                              {actionInProgress === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
