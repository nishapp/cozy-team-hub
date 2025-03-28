import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import BitCard from "@/components/bits/BitCard";
import HeaderAddBitButton from "@/components/bits/HeaderAddBitButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FeaturedBits from "@/components/bits/FeaturedBits";

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
];

const categoryImages = [
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1519748771451-a94c596ffd67?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1529245856630-f4853233d2ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
];

const categoryTitles = [
  "Fashion",
  "Home Decor",
  "Technology",
  "Travel",
  "Food & Recipes",
  "Health & Fitness",
  "Art & Design",
  "DIY & Crafts"
];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [bits, setBits] = useState<Bit[]>(sampleBits);
  const [bitCount, setBitCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      setGreeting("Good Morning");
    } else if (hours >= 12 && hours < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

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
    
    setBitCount(sampleBits.length);
  }, [user]);

  const handleBitAdded = (newBit: Bit) => {
    const bitWithId = {
      ...newBit,
      id: newBit.id || `temp-${Date.now()}`,
    };
    
    setBits([bitWithId, ...bits]);
    setBitCount(bitCount + 1);
    toast.success("Bit added successfully!");
  };

  const handleBitUpdated = (updatedBit: Bit) => {
    setBits(
      bits.map(bit => bit.id === updatedBit.id ? updatedBit : bit)
    );
    toast.success("Bit updated successfully!");
  };

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
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-4xl font-bold">My Inspiration Board</h1>
                  <span className="text-muted-foreground">{bitCount} Pins</span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {greeting}, {fullName}. Here are your bits ready to be shared.
                </p>
              </div>
              <HeaderAddBitButton onBitAdded={handleBitAdded} />
            </div>
            
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="rounded-full px-6 py-1 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium"
                onClick={() => navigate('/bits')}
              >
                View board
              </Button>
            </div>
          </div>
          
          <FeaturedBits images={categoryImages} titles={categoryTitles} />
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">More ideas for this board</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
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
