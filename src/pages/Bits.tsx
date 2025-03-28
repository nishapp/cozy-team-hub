
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import BitCard from "@/components/bits/BitCard";
import BitDetailModal from "@/components/bits/BitDetailModal";
import HeaderAddBitButton from "@/components/bits/HeaderAddBitButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Update the Bit interface to include shared_by
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
  shared_by?: string; // Add shared_by as optional
  isBookmarked?: boolean;
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

const Bits = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [bits, setBits] = useState<Bit[]>(sampleBits);
  const [bookmarkedBits, setBookmarkedBits] = useState<Bit[]>([]);
  const [bitCount, setBitCount] = useState<number>(0);
  const [selectedBit, setSelectedBit] = useState<Bit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const navigate = useNavigate();

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
    setBitCount(sampleBits.length);
    
    // Load bookmarked bits from localStorage
    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem('bookmarkedBits');
        if (savedBookmarks) {
          const bookmarkIds = JSON.parse(savedBookmarks) as string[];
          const markedBits = bits.map(bit => ({
            ...bit,
            isBookmarked: bookmarkIds.includes(bit.id)
          }));
          setBits(markedBits);
          
          const bookmarked = markedBits.filter(bit => bit.isBookmarked);
          setBookmarkedBits(bookmarked);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };
    
    loadBookmarks();
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
    setBitCount(prevCount => prevCount + 1);
    toast.success("Bit added successfully!");
  };

  // Handle updating an existing bit
  const handleBitUpdated = (updatedBit: Bit) => {
    const updatedBits = bits.map(bit => 
      bit.id === updatedBit.id ? { ...updatedBit, isBookmarked: bit.isBookmarked } : bit
    );
    setBits(updatedBits);
    
    // Also update in bookmarked bits if necessary
    if (bookmarkedBits.some(bit => bit.id === updatedBit.id)) {
      setBookmarkedBits(bookmarkedBits.map(bit => 
        bit.id === updatedBit.id ? { ...updatedBit, isBookmarked: true } : bit
      ));
    }
    
    toast.success("Bit updated successfully!");
  };

  // Handle bit selection for modal
  const handleBitSelected = (bit: Bit) => {
    setSelectedBit(bit);
  };
  
  // Handle bookmark toggling
  const handleBookmarkToggle = (bit: Bit, isBookmarked: boolean) => {
    // Update the bit in the main bits array
    const updatedBits = bits.map(b => 
      b.id === bit.id ? { ...b, isBookmarked } : b
    );
    setBits(updatedBits);
    
    // Update bookmarked bits array
    if (isBookmarked) {
      setBookmarkedBits([...bookmarkedBits, { ...bit, isBookmarked: true }]);
    } else {
      setBookmarkedBits(bookmarkedBits.filter(b => b.id !== bit.id));
    }
    
    // Save to localStorage
    try {
      const bookmarkIds = updatedBits
        .filter(b => b.isBookmarked)
        .map(b => b.id);
      localStorage.setItem('bookmarkedBits', JSON.stringify(bookmarkIds));
    } catch (error) {
      console.error("Error saving bookmarks:", error);
    }
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8"
              >
                <ArrowLeft size={18} />
              </Button>
              <h1 className="text-3xl font-bold">My Bits</h1>
              <span className="text-muted-foreground">{bitCount} Pins</span>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                All your bits in one place. Browse and organize your collection.
              </p>
              <div className="flex items-center gap-2">
                <HeaderAddBitButton onBitAdded={handleBitAdded} />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Bits</TabsTrigger>
              <TabsTrigger value="bookmarked">
                Bookmarked ({bookmarkedBits.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              {/* Pinterest-style masonry grid for all bits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {bits.map((bit) => (
                  <BitCard 
                    key={bit.id} 
                    bit={bit} 
                    onBitUpdated={handleBitUpdated}
                    onClick={() => handleBitSelected(bit)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
              
              {bits.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No bits yet. Add your first bit!</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bookmarked" className="mt-6">
              {/* Pinterest-style masonry grid for bookmarked bits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-max">
                {bookmarkedBits.map((bit) => (
                  <BitCard 
                    key={bit.id} 
                    bit={bit} 
                    onBitUpdated={handleBitUpdated}
                    onClick={() => handleBitSelected(bit)}
                    onBookmarkToggle={handleBookmarkToggle}
                  />
                ))}
              </div>
              
              {bookmarkedBits.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No bookmarked bits yet. Bookmark some bits to see them here!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {/* Bit Detail Modal */}
          {selectedBit && (
            <BitDetailModal 
              bit={{...selectedBit, shared_by: selectedBit.shared_by || "You"}} 
              isOpen={!!selectedBit} 
              onClose={() => setSelectedBit(null)} 
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Bits;
