
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import TeamList from "../components/team/TeamList";
import InviteForm from "../components/team/InviteForm";
import PageTransition from "../components/ui/PageTransition";
import { Button } from "@/components/ui/button";

const Team = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    organizations, 
    currentOrganization,
    members,
    userRole,
    loading: orgLoading,
    fetchOrganizationMembers
  } = useOrganization();

  useEffect(() => {
    if (currentOrganization) {
      fetchOrganizationMembers(currentOrganization.id);
    }
  }, [currentOrganization]);

  // Redirect unauthenticated users to login
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect users with no organizations to create one
  if (user && !authLoading && !orgLoading && organizations.length === 0) {
    return <Navigate to="/organization" replace />;
  }

  if (authLoading || orgLoading) {
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
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
                <p className="text-muted-foreground mt-1">
                  Manage the members of {currentOrganization?.name}
                </p>
              </div>

              {userRole === "admin" && (
                <Button 
                  onClick={() => {
                    const modal = document.getElementById("invite-member-modal") as HTMLDialogElement;
                    if (modal) modal.showModal();
                  }}
                >
                  Invite Member
                </Button>
              )}
            </div>
            
            {members.length > 0 ? (
              <TeamList members={members} />
            ) : (
              <div className="border rounded-lg p-12 text-center bg-muted/50">
                <h3 className="text-xl font-semibold">No team members yet</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  {userRole === "admin"
                    ? "Invite your team members to collaborate in this organization."
                    : "No team members have been added to this organization yet."}
                </p>
                
                {userRole === "admin" && (
                  <Button 
                    className="mt-6"
                    onClick={() => {
                      const modal = document.getElementById("invite-member-modal") as HTMLDialogElement;
                      if (modal) modal.showModal();
                    }}
                  >
                    Invite Your First Team Member
                  </Button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Invite Modal */}
        {userRole === "admin" && (
          <dialog id="invite-member-modal" className="modal p-6 rounded-lg shadow-lg border bg-background max-w-md w-full">
            <div className="modal-box p-0">
              <InviteForm />
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const modal = document.getElementById("invite-member-modal") as HTMLDialogElement;
                    if (modal) modal.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </PageTransition>
  );
};

export default Team;
