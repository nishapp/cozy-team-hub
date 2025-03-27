
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useOrganization } from "../hooks/useOrganization";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import CreateOrganization from "../components/organizations/CreateOrganization";
import OrganizationCard from "../components/organizations/OrganizationCard";
import PageTransition from "../components/ui/PageTransition";

const Organization = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    organizations, 
    currentOrganization,
    loading: orgLoading
  } = useOrganization();

  // Redirect unauthenticated users to login
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user has no organizations, show the create form
  if (organizations.length === 0) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <CreateOrganization />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="page-container">
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organizations or create a new one
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <OrganizationCard 
                  key={org.id} 
                  organization={org} 
                  isActive={currentOrganization?.id === org.id}
                />
              ))}
              
              {/* Create New Organization Card */}
              <Card className="border-dashed bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer flex flex-col items-center justify-center h-full p-6" onClick={() => {
                const modal = document.getElementById("create-org-modal") as HTMLDialogElement;
                if (modal) modal.showModal();
              }}>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <h3 className="text-lg font-medium">Create New Organization</h3>
                <p className="text-sm text-muted-foreground mt-1 text-center">
                  Set up a new organization for your team
                </p>
              </Card>
            </div>
          </div>
        </main>

        {/* Create Organization Modal */}
        <dialog id="create-org-modal" className="modal p-6 rounded-lg shadow-lg border bg-background max-w-md w-full">
          <div className="modal-box p-0">
            <CreateOrganization />
            <div className="mt-6 text-center">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground"
                onClick={() => {
                  const modal = document.getElementById("create-org-modal") as HTMLDialogElement;
                  if (modal) modal.close();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </PageTransition>
  );
};

// Card component for the "Create New Organization" card
function Card({ children, className, ...props }: React.HTMLProps<HTMLDivElement>) {
  return (
    <div 
      className={`rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Organization;
