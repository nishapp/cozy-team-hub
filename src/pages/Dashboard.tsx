
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";

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
            
            {/* Empty dashboard - ready for new components */}
            <div className="mt-6 text-center py-12">
              <h3 className="text-xl font-semibold mb-2">Your Dashboard is Ready</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                This empty dashboard is ready for new components and functionality.
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
