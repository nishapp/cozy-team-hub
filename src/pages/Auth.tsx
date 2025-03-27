
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import AuthForm from "../components/auth/AuthForm";
import PageTransition from "../components/ui/PageTransition";

const Auth = () => {
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          {/* Auth Form Side */}
          <div className="flex items-center justify-center p-8">
            <AuthForm />
          </div>

          {/* Image/Brand Side */}
          <div className="hidden lg:flex bg-primary/5 items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-3xl text-primary-foreground font-bold">S</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-4">Welcome to SaaS Starter</h1>
              <p className="text-muted-foreground">
                An all-in-one solution for authentication and team management. Sign in to continue building amazing things.
              </p>
              
              <div className="mt-10 grid grid-cols-2 gap-6">
                <div className="text-left">
                  <div className="p-2 bg-primary/10 rounded-full w-fit mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <h3 className="font-medium">Authentication</h3>
                  <p className="text-sm text-muted-foreground mt-1">Secure email login with Supabase.</p>
                </div>
                
                <div className="text-left">
                  <div className="p-2 bg-primary/10 rounded-full w-fit mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </div>
                  <h3 className="font-medium">Organizations</h3>
                  <p className="text-sm text-muted-foreground mt-1">Create and manage multiple teams.</p>
                </div>
                
                <div className="text-left">
                  <div className="p-2 bg-primary/10 rounded-full w-fit mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <h3 className="font-medium">Team Management</h3>
                  <p className="text-sm text-muted-foreground mt-1">Role-based access control system.</p>
                </div>
                
                <div className="text-left">
                  <div className="p-2 bg-primary/10 rounded-full w-fit mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                  </div>
                  <h3 className="font-medium">Minimal Setup</h3>
                  <p className="text-sm text-muted-foreground mt-1">Ready to use with minimal configuration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
