
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import ProfileForm from "../components/settings/ProfileForm";
import PasswordForm from "../components/settings/PasswordForm";
import DangerZone from "../components/settings/DangerZone";
import PageTransition from "../components/ui/PageTransition";
import Navbar from "../components/layout/Navbar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Home, User, KeyRound, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <div className="container max-w-screen-xl mx-auto px-4 py-10">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                    <Home className="mr-1 h-4 w-4" />
                    Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium">Settings</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex flex-col space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your account settings and preferences.
              </p>
            </div>

            <Card className="overflow-hidden border bg-card shadow-sm">
              <Tabs
                defaultValue="profile"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 p-6 border-b sm:border-b-0 sm:border-r border-border bg-muted/30">
                    <TabsList className="flex flex-col w-full h-auto gap-1 bg-transparent">
                      <TabsTrigger 
                        value="profile" 
                        className="justify-start w-full px-3 py-2 text-sm h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger 
                        value="password" 
                        className="justify-start w-full px-3 py-2 text-sm h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Password
                      </TabsTrigger>
                      <TabsTrigger 
                        value="danger" 
                        className="justify-start w-full px-3 py-2 text-sm h-10 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                      >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Danger Zone
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1">
                    <TabsContent value="profile" className="m-0">
                      <ProfileForm />
                    </TabsContent>

                    <TabsContent value="password" className="m-0">
                      <PasswordForm />
                    </TabsContent>

                    <TabsContent value="danger" className="m-0">
                      <DangerZone />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
