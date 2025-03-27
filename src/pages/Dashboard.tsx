
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();

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
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Email:</span>
                      <span>{user?.email}</span>
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
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Profile</CardTitle>
                  <CardDescription>Your profile information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Email:</span>
                      <span>{user?.email}</span>
                    </div>
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
