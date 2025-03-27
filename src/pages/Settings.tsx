
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../context/AuthContext";
import ProfileForm from "../components/settings/ProfileForm";
import PasswordForm from "../components/settings/PasswordForm";
import DangerZone from "../components/settings/DangerZone";
import PageTransition from "../components/ui/PageTransition";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="container max-w-screen-lg py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent
              value="profile"
              className="space-y-8 bg-card p-6 rounded-md border shadow-sm"
            >
              <ProfileForm />
            </TabsContent>

            <TabsContent
              value="password"
              className="space-y-8 bg-card p-6 rounded-md border shadow-sm"
            >
              <PasswordForm />
            </TabsContent>

            <TabsContent
              value="danger"
              className="space-y-8 bg-card p-6 rounded-md border shadow-sm"
            >
              <DangerZone />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
