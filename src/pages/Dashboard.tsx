
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import BitCard from "@/components/bits/BitCard";
import HeaderAddBitButton from "@/components/bits/HeaderAddBitButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Define the Bit type
interface Bit {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  visibility: string;
  wdylt_comment?: string;
  image_url?: string;
  created_at: string;
}

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
  const [bits, setBits] = useState<Bit[]>(sampleBits);
  const [bitCount, setBitCount] = useState<number>(0);

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
    setBitCount(sampleBits.length);
  }, [user]);

  // Handle adding a new bit
  const handleBitAdded = (newBit: Bit) => {
    // Generate a unique ID if none exists
    const bitWithId = {
      ...newBit,
      id: newBit.id || `temp-${Date.now()}`,
    };
    
    // Add the new bit to the beginning of the array
    setBits([bitWithId, ...bits]);
    setBitCount(bitCount + 1);
    toast.success("Bit added successfully!");
  };

  // Handle updating an existing bit
  const handleBitUpdated = (updatedBit: Bit) => {
    setBits(
      bits.map(bit => bit.id === updatedBit.id ? updatedBit : bit)
    );
    toast.success("Bit updated successfully!");
  };

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
          {/* Pinterest-inspired board header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-baseline gap-4">
                <h1 className="text-3xl font-bold">My Bits</h1>
                <span className="text-muted-foreground">{bitCount} Pins</span>
              </div>
              <HeaderAddBitButton onBitAdded={handleBitAdded} />
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="secondary" 
                className="rounded-full px-6 py-1 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium"
              >
                View board
              </Button>
              <p className="text-muted-foreground">
                {greeting}, {fullName}. Here are your bits ready to be shared.
              </p>
            </div>
          </div>
          
          {/* Pinterest-style masonry grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {bits.map((bit) => (
              <BitCard 
                key={bit.id} 
                bit={bit} 
                onBitUpdated={handleBitUpdated} 
              />
            ))}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
