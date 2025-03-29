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
import FeaturedBits from "@/components/bits/FeaturedBits";
import SharedBitsCarousel from "@/components/bits/SharedBitsCarousel";
import GamificationTopBar from "@/components/gamification/GamificationTopBar";
import TopBuddiesSection from "@/components/friends/TopBuddiesSection";

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
  shared_by?: string;
  link?: string;
  author_avatar?: string;
  friend_count?: number;
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
    link: "https://www.typescriptlang.org/docs/",
    author_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    friend_count: 3
  }, {
    id: "2",
    title: "React Hooks Deep Dive",
    description: "Understanding useEffect, useMemo, and useCallback in depth.",
    tags: ["react", "javascript", "hooks"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Hooks have changed the way I write React!",
    created_at: new Date().toISOString(),
    link: "https://reactjs.org/docs/hooks-intro.html",
    author_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    friend_count: 5
  }, {
    id: "3",
    title: "Mindfulness Meditation",
    description: "Practicing mindfulness daily has improved my focus and reduced stress significantly.",
    tags: ["wellness", "mindfulness", "health"],
    category: "health",
    visibility: "public",
    wdylt_comment: "Feeling centered and calm.",
    image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    created_at: new Date().toISOString(),
    link: "https://www.mindful.org/meditation/mindfulness-getting-started/",
    author_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
    friend_count: 1
  }
];

const friendSharedBits = [{
  id: "f1",
  title: "Travel Photography Tips",
  description: "Expert tips for capturing stunning travel photos with any camera. Learn composition, lighting and editing techniques.",
  tags: ["photography", "travel", "tips"],
  category: "photography",
  visibility: "public",
  wdylt_comment: "These tips changed my travel photography game!",
  image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Emma Watson",
  author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  friend_count: 2
}, {
  id: "f2",
  title: "Homemade Pasta Recipe",
  description: "Simple and delicious homemade pasta recipe. Learn to make pasta from scratch with just a few ingredients.",
  tags: ["cooking", "recipe", "italian"],
  category: "food",
  visibility: "public",
  wdylt_comment: "Never buying store pasta again!",
  image_url: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Gordon Ramsay",
  author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  friend_count: 6
}, {
  id: "f3",
  title: "Urban Gardening Ideas",
  description: "Innovative solutions for growing plants in small urban spaces. Perfect for apartment dwellers.",
  tags: ["gardening", "urban", "plants"],
  category: "gardening",
  visibility: "public",
  wdylt_comment: "My balcony has never looked better!",
  image_url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Martha Stewart",
  author_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  friend_count: 3
}, {
  id: "f4",
  title: "Minimal Web Design Principles",
  description: "Key principles of effective minimal web design. Less is more when done right.",
  tags: ["design", "web", "minimal"],
  category: "design",
  visibility: "public",
  image_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "John Doe",
  author_avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop",
  friend_count: 0
}, {
  id: "f5",
  title: "Beginner's Guide to Houseplants",
  description: "Easy-to-care-for houseplants that even beginners can keep alive and thriving.",
  tags: ["plants", "indoor", "gardening"],
  category: "plants",
  visibility: "public",
  image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Jane Smith",
  author_avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop",
  friend_count: 4
}, {
  id: "f6",
  title: "Modern Calligraphy Basics",
  description: "Learn the fundamentals of modern calligraphy and start creating beautiful lettering today.",
  tags: ["art", "calligraphy", "handwriting"],
  category: "art",
  visibility: "public",
  image_url: "https://images.unsplash.com/photo-1455651192900-d9d2a5c3091e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Mark Johnson",
  author_avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop",
  friend_count: 2
}, {
  id: "f7",
  title: "DIY Natural Cleaning Solutions",
  description: "Eco-friendly cleaning recipes using ingredients you already have at home.",
  tags: ["eco", "cleaning", "diy"],
  category: "home",
  visibility: "public",
  wdylt_comment: "My house smells amazing now!",
  image_url: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "David Green",
  author_avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop",
  friend_count: 1
}, {
  id: "f8",
  title: "Effective Home Office Setup",
  description: "Create a productive and comfortable workspace in your home with these proven tips.",
  tags: ["productivity", "workspace", "wfh"],
  category: "work",
  visibility: "public",
  image_url: "https://images.unsplash.com/photo-1593642634443-44adaa06623a?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  created_at: new Date().toISOString(),
  shared_by: "Sarah Connor",
  author_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  friend_count: 3
}];

const categoryImages = ["https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1529245856630-f4853233d2ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1519748771451-a94c596ffd67?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1529245856630-f4853233d2ea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"];
const categoryTitles = ["Fashion", "Home Decor", "Technology", "Travel", "Food & Recipes", "Health & Fitness", "Art & Design", "DIY & Crafts"];

const sampleBadges = [
  {
    id: "1",
    name: "Newcomer",
    description: "Created your first bit",
    imageUrl: "/badges/newcomer.png", 
    pointsReward: 50,
    earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Consistency",
    description: "Maintained a 3-day streak",
    imageUrl: "/badges/streak.png",
    pointsReward: 75,
    earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Buddy Network",
    description: "Connected with 5 buddies",
    imageUrl: "/badges/network.png",
    pointsReward: 100,
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const sampleActivityDates = [
  new Date(), // today
  new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // yesterday
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
];

const Dashboard = () => {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("Hello");
  const [bits, setBits] = useState<Bit[]>(sampleBits);
  const [publicBits, setPublicBits] = useState<Bit[]>([]);
  const [bitCount, setBitCount] = useState<number>(0);
  const [sharedBits, setSharedBits] = useState<any[]>(friendSharedBits);
  const [selectedBit, setSelectedBit] = useState<Bit | null>(null);
  const [points, setPoints] = useState(1250);
  const [level, setLevel] = useState(4);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [longestStreak, setLongestStreak] = useState(10);
  const [badges, setBadges] = useState(sampleBadges);
  const [activityDates, setActivityDates] = useState(sampleActivityDates);
  const [topBuddies, setTopBuddies] = useState([
    {
      id: "1",
      name: "Emma Watson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      topBit: {
        id: "f1",
        title: "Travel Photography Tips",
        image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }
    },
    {
      id: "2",
      name: "Gordon Ramsay",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      topBit: {
        id: "f2",
        title: "Homemade Pasta Recipe",
        image_url: "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }
    },
    {
      id: "3",
      name: "Martha Stewart",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      topBit: {
        id: "f3",
        title: "Urban Gardening Ideas",
        image_url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }
    },
    {
      id: "4",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop",
      topBit: {
        id: "f4",
        title: "Minimal Web Design Principles",
        image_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }
    },
    {
      id: "5",
      name: "Jane Smith",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop",
      topBit: {
        id: "f5",
        title: "Beginner's Guide to Houseplants",
        image_url: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      }
    }
  ]);
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
      const {
        data,
        error
      } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      if (data && data.full_name) {
        setFullName(data.full_name);
      }
    };
    fetchUserProfile();

    const filteredPublicBits = sampleBits.filter(bit => bit.visibility === "public");
    setPublicBits(filteredPublicBits);
    setBitCount(sampleBits.length);
  }, [user]);

  const handleBitAdded = (newBit: Bit) => {
    const bitWithId = {
      ...newBit,
      id: newBit.id || `temp-${Date.now()}`
    };
    setBits([bitWithId, ...bits]);
    if (bitWithId.visibility === "public") {
      setPublicBits([bitWithId, ...publicBits]);
    }
    setBitCount(bitCount + 1);
    toast.success("Bit added successfully!");
  };

  const handleBitUpdated = (updatedBit: Bit) => {
    setBits(bits.map(bit => bit.id === updatedBit.id ? updatedBit : bit));
    if (updatedBit.visibility === "public") {
      if (publicBits.some(bit => bit.id === updatedBit.id)) {
        setPublicBits(publicBits.map(bit => bit.id === updatedBit.id ? updatedBit : bit));
      } else {
        setPublicBits([updatedBit, ...publicBits]);
      }
    } else {
      setPublicBits(publicBits.filter(bit => bit.id !== updatedBit.id));
    }
    toast.success("Bit updated successfully!");
  };

  const handleBitSelected = (bit: Bit) => {
    setSelectedBit(bit);
  };

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>;
  }

  return <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <GamificationTopBar 
            points={points}
            level={level}
            currentStreak={currentStreak}
            badges={badges}
            activityDates={activityDates}
          />
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-4xl font-bold">My Reading Board</h1>
                  <span className="text-muted-foreground">{bitCount} Pins</span>
                </div>
                <p className="text-muted-foreground mt-1">
                  {greeting}, {fullName}. Here are your bits ready to be shared.
                </p>
              </div>
              <HeaderAddBitButton onBitAdded={handleBitAdded} />
            </div>
            
            <div className="mt-4">
              <Button variant="secondary" className="rounded-full px-6 py-1 h-auto bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-medium" onClick={() => navigate('/bits')}>
                View board
              </Button>
            </div>
          </div>
          
          <FeaturedBits images={categoryImages} titles={categoryTitles} />
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="w-full md:w-2/3 lg:w-3/4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">My sharable bits</h2>
                <p className="text-muted-foreground">Bits with public visibility that can be shared with others</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {publicBits.length > 0 ? 
                  publicBits.slice(0, 3).map(bit => 
                    <BitCard 
                      key={bit.id} 
                      bit={bit} 
                      onBitUpdated={handleBitUpdated} 
                      onClick={() => handleBitSelected(bit)} 
                    />
                  ) : 
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No public bits found. Make some of your bits public to share them!</p>
                  </div>
                }
              </div>
              
              {publicBits.length > 3 && (
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="text-sm"
                    onClick={() => navigate('/bits')}
                  >
                    View all bits
                  </Button>
                </div>
              )}
            </div>
            
            <TopBuddiesSection buddies={topBuddies} />
          </div>

          <SharedBitsCarousel sharedBits={sharedBits} />

          {/* Bit Detail Modal */}
          {selectedBit && <BitDetailModal 
            bit={{
              ...selectedBit,
              shared_by: selectedBit.shared_by || "You"
            }} 
            isOpen={!!selectedBit} 
            onClose={() => setSelectedBit(null)}
            onBitUpdated={handleBitUpdated} 
          />}
        </main>
      </div>
    </PageTransition>;
};

export default Dashboard;
