
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import BitCard from "@/components/bits/BitCard";

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
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [bits, setBits] = useState(sampleBits);

  useEffect(() => {
    // Set greeting based on time of day
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              {greeting}, {fullName}
            </h1>
            <p className="text-muted-foreground mt-2">
              Here are your latest bits. What did you learn today?
            </p>
          </div>
          
          {/* Pinterest-style masonry grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {bits.map((bit) => (
              <BitCard key={bit.id} bit={bit} />
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
