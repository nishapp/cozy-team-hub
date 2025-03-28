
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import BitCard from "@/components/bits/BitCard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import SearchBar from "@/components/layout/SearchBar";

// Sample data for demonstration purposes
const sampleBits = [
  {
    id: "1",
    title: "Learning TypeScript",
    description: "Notes on advanced TypeScript features and patterns. TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    tags: ["programming", "typescript", "web development"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Excited to master TypeScript!",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    description: "Understanding useEffect, useMemo, and useCallback in depth.",
    tags: ["react", "javascript", "hooks"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Hooks have changed the way I write React!",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Mindfulness Meditation",
    description: "Practicing mindfulness daily has improved my focus and reduced stress significantly.",
    tags: ["wellness", "mindfulness", "health"],
    category: "health",
    visibility: "public",
    wdylt_comment: "Feeling centered and calm.",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Garden Progress",
    description: "My vegetable garden is thriving this year. The tomatoes and peppers are coming in nicely.",
    tags: ["gardening", "vegetables", "hobby"],
    category: "hobbies",
    visibility: "public",
    wdylt_comment: "Growing my own food is so rewarding!",
    image_url: "https://images.unsplash.com/photo-1466692476655-ab0c26c69cbf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Book Review: Atomic Habits",
    description: "James Clear's book on building good habits and breaking bad ones. Highly recommended for anyone looking to make positive changes in their life.",
    tags: ["books", "productivity", "habits"],
    category: "reading",
    visibility: "public",
    wdylt_comment: "This book changed my approach to habits!",
    image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Summer Fashion Trends",
    description: "Exploring the hottest fashion trends for this summer season. Bright colors and flowy fabrics are in!",
    tags: ["fashion", "trends", "summer"],
    category: "lifestyle",
    visibility: "public",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Mountain Hiking Tips",
    description: "Essential tips for safe and enjoyable mountain hiking experiences. Always be prepared!",
    tags: ["hiking", "outdoors", "mountains"],
    category: "adventure",
    visibility: "public",
    image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
  }
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [bits, setBits] = useState(sampleBits);

  useEffect(() => {
    // Fetch user's profile data to get full name
    const fetchUserProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data && data.full_name) {
        setFullName(data.full_name);
      }
    };

    fetchUserProfile();
    
    // Here you would fetch actual bits from Supabase once implemented
    // For now we're using sample data
  }, [user]);

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
      <SidebarProvider>
        <div className="flex min-h-screen bg-white dark:bg-black">
          <LeftSidebar />
          
          <SidebarInset>
            <main className="flex-1 p-4 md:py-6 md:px-8">
              <div className="flex justify-center items-center sticky top-0 z-10 bg-white dark:bg-black py-4">
                <SearchBar />
              </div>
              
              {/* Pinterest-style masonry grid */}
              <div className="masonry-grid mt-4 px-0 md:px-4 mx-auto">
                {bits.map((bit) => (
                  <div key={bit.id} className="masonry-item">
                    <BitCard bit={bit} />
                  </div>
                ))}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </PageTransition>
  );
};

export default Dashboard;
