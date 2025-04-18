
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, isDemoMode } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: {
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
  } | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch profile data when user changes
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setProfile(null);
      }
    };
    
    fetchProfileData();
  }, [user]);

  async function signUp(email: string, password: string, metadata?: Record<string, any>) {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Sign up successful! Please check your email for verification.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      
      const { error: authError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Check if user is suspended
      if (data?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_suspended')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("Error checking suspension status:", profileError);
        }
        
        if (profileData?.is_suspended) {
          // Sign out the user as they are suspended
          await supabase.auth.signOut();
          throw new Error("Your account has been suspended. Please contact an administrator.");
        }
      }

      navigate("/dashboard");
      toast.success("Signed in successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      setLoading(true);
      
      // Clear any cached data before signing out
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("currentOrganizationId");
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast.success("Signed out successfully");
      navigate("/auth", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email: string) {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      toast.success("Password reset email sent");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
