
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import AdminSection from "@/components/admin/AdminSection";
import PageTransition from "@/components/ui/PageTransition";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) throw error;
        
        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        toast.error("Failed to verify admin permissions");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!isAdmin) {
    toast.error("You don't have permission to access the admin dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="page-container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage users and system settings
              </p>
            </div>
            
            <AdminSection />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
