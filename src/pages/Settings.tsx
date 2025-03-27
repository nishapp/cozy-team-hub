
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "../components/settings/ProfileForm";
import PasswordForm from "../components/settings/PasswordForm";
import DangerZone from "../components/settings/DangerZone";
import { supabase, isDemoMode } from "../lib/supabase";
import { toast } from "sonner";

const Settings = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

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
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account and preferences
              </p>
            </div>
            
            <div className="max-w-3xl">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-6">
                  <ProfileForm user={user} />
                </TabsContent>
                
                <TabsContent value="password" className="space-y-6">
                  <PasswordForm />
                </TabsContent>
              </Tabs>
              
              <DangerZone signOut={signOut} navigate={navigate} isDemoMode={isDemoMode} />
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Settings;
