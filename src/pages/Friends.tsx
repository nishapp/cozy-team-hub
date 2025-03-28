
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import FriendsList from "@/components/friends/FriendsList";
import FriendRequests from "@/components/friends/FriendRequests";
import FriendRecommendations from "@/components/friends/FriendRecommendations";

const Friends = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("friends");

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
        
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Buddies</h1>
            <p className="text-muted-foreground mt-2">
              Connect with other users, manage buddy requests, and discover new connections.
            </p>
          </div>
          
          <Tabs defaultValue="friends" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="friends">My Buddies</TabsTrigger>
              <TabsTrigger value="requests">Buddy Requests</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends" className="space-y-4">
              <FriendsList />
            </TabsContent>
            
            <TabsContent value="requests" className="space-y-4">
              <FriendRequests />
            </TabsContent>
            
            <TabsContent value="discover" className="space-y-4">
              <FriendRecommendations />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
};

export default Friends;
