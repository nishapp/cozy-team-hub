
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import ProfileAvatar from "@/components/ui/ProfileAvatar";

type ProfileData = {
  full_name?: string | null;
  avatar_url?: string | null;
  role?: 'admin' | 'user';
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Redirect unauthenticated users to login
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAdmin = profileData?.role === 'admin';

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="page-container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome to your dashboard
                {isAdmin && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                  Admin
                </span>}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar 
                        src={profileData?.avatar_url} 
                        fallbackText={profileData?.full_name}
                        size="md"
                      />
                      <div>
                        {profileData?.full_name && (
                          <p className="font-medium">{profileData.full_name}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <p className="text-xs">
                          User Type: <span className={isAdmin ? "text-primary font-medium" : "text-muted-foreground"}>
                            {isAdmin ? "Admin" : "Normal"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">User ID:</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={user?.id}>
                        {user?.id}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <a href="/settings" className="block p-2 text-sm text-primary hover:underline">
                      → Update Settings
                    </a>
                    {isAdmin && (
                      <a href="/admin" className="block p-2 text-sm text-primary hover:underline">
                        → Admin Dashboard
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <ProfileAvatar 
                      src={profileData?.avatar_url} 
                      fallbackText={profileData?.full_name}
                      size="lg"
                    />
                    <div>
                      <h3 className="font-medium">{profileData?.full_name || "Update your profile"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profileData?.full_name ? "Your profile is complete" : "Add your details in settings"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <a href="/settings" className="text-sm text-primary hover:underline">
                      Edit profile →
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empty state placeholder */}
            <div className="mt-12 border rounded-lg p-8 text-center bg-muted/50">
              <h3 className="text-xl font-semibold">Your Dashboard is Ready</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                This is where your application content would go. Customize this section based on your specific needs.
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
