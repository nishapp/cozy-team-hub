import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import BitCard from "@/components/bits/BitCard";
import BitDetailModal from "@/components/bits/BitDetailModal";
import DailyLearningSection from "@/components/bits/DailyLearningSection";
import { Calendar, User, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sampleFriends } from "@/data/sampleFriends";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Glow } from "@/components/ui/glow";

const sampleFriendBits = [
  {
    id: "bit1",
    title: "My First Coding Project",
    description: "Just finished my first React application. It was challenging but rewarding!",
    tags: ["coding", "react", "webdev"],
    category: "coding",
    visibility: "public",
    image_url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2831&auto=format&fit=crop",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    shared_by: "Jane Doe",
    author_avatar: "https://i.pravatar.cc/150?img=23"
  },
  {
    id: "bit2",
    title: "Morning Run Routine",
    description: "Started a new morning routine - 5K run before breakfast. Feeling energized!",
    tags: ["health", "running", "morning"],
    category: "health",
    visibility: "public",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    shared_by: "Jane Doe"
  },
  {
    id: "bit3",
    title: "Book Recommendation",
    description: "Just finished 'Atomic Habits' by James Clear. Highly recommend for anyone looking to build better habits.",
    tags: ["reading", "books", "productivity"],
    category: "reading",
    visibility: "public",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    shared_by: "Jane Doe",
    wdylt_comment: "Changed my perspective on habit formation."
  }
];

const sampleDailyLearnings = [
  {
    id: "learn1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Today I learned how to implement authentication in React apps using JWT tokens. The hardest part was handling token refresh, but I found a clever solution using interceptors.",
    tags: ["react", "authentication", "jwt"],
    relatedBitId: "bit1",
    title: "Authentication in React"
  },
  {
    id: "learn2",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: "CSS Grid is much more powerful than I initially thought. I can create complex layouts with minimal HTML structure.",
    tags: ["css", "layout", "web-design"],
    title: "CSS Grid Mastery",
    externalUrl: "https://css-tricks.com/snippets/css/complete-guide-grid/"
  },
  {
    id: "learn3",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Learned about the useCallback hook in React and how it helps with memoization to prevent unnecessary re-renders in child components.",
    tags: ["react", "hooks", "performance"],
    relatedBitId: "bit3",
    title: "React Performance Optimization"
  },
  {
    id: "learn4",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Discovered a great resource for TypeScript best practices. This article explains how to properly type React components and hooks.",
    tags: ["typescript", "react", "best-practices"],
    title: "TypeScript and React",
    externalUrl: "https://react-typescript-cheatsheet.netlify.app/"
  }
];

const FriendBits = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [friend, setFriend] = useState<any>(null);
  const [bits, setBits] = useState(sampleFriendBits);
  const [learnings, setLearnings] = useState(sampleDailyLearnings);
  const [loading, setLoading] = useState(true);
  const [selectedBit, setSelectedBit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("bits");

  useEffect(() => {
    if (friendId) {
      const foundFriend = sampleFriends.find(f => f.id === friendId);
      setFriend(foundFriend);
      setLoading(false);
    }
  }, [friendId]);

  const handleBitClick = (bit: any) => {
    setSelectedBit({
      ...bit,
      shared_by: friend?.name || bit.shared_by,
      author_avatar: friend?.avatar_url || bit.author_avatar
    });
    setIsModalOpen(true);
  };

  const handleRelatedBitClick = (bitId: string) => {
    const bit = bits.find(b => b.id === bitId);
    if (bit) {
      handleBitClick(bit);
    } else {
      toast.error("Related bit not found");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleBitUpdated = (updatedBit: any) => {
    const updatedBits = bits.map(bit => 
      bit.id === updatedBit.id ? { ...bit, ...updatedBit } : bit
    );
    setBits(updatedBits);
    toast.success("Bit updated successfully!");
  };

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Friend Not Found</h1>
          <p className="text-muted-foreground">The friend you're looking for doesn't exist or isn't accessible.</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="relative overflow-hidden rounded-xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-purple-600 to-pink-600 opacity-95" />
            <Glow className="opacity-75" />
            <div className="relative z-10 p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <ProfileAvatar 
                  src={friend.avatar_url} 
                  fallbackText={friend.name}
                  size="xl"
                  className="border-4 border-white/30 shadow-lg"
                />
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h1 className="text-4xl font-bold text-white drop-shadow-md">{friend.name}</h1>
                    <div className="flex items-center justify-center md:justify-start mt-2 text-white/80">
                      <Mail className="w-4 h-4 mr-1" />
                      <span>{friend.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <Calendar className="w-4 h-4 mr-1.5 text-white" />
                      <span className="text-sm text-white">
                        Joined {formatDistanceToNow(new Date(friend.joined_date), { addSuffix: true })}
                      </span>
                    </div>
                    {friend.mutual_friends > 0 && (
                      <div className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <User className="w-4 h-4 mr-1.5 text-white" />
                        <span className="text-sm text-white">{friend.mutual_friends} mutual friends</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-muted/60 backdrop-blur-sm">
              <TabsTrigger value="bits">Bits</TabsTrigger>
              <TabsTrigger value="learnings">Daily Learnings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bits" className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">{friend.name}'s Bits</h2>
              
              {bits.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No bits found</h3>
                  <p className="text-muted-foreground">
                    {friend.name} hasn't shared any bits yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bits.map(bit => (
                    <BitCard 
                      key={bit.id} 
                      bit={{...bit, shared_by: friend.name, author_avatar: friend.avatar_url}}
                      onClick={() => handleBitClick(bit)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="learnings" className="animate-fade-in">
              <DailyLearningSection 
                learnings={learnings}
                friendName={friend.name}
                friendAvatar={friend.avatar_url}
                bits={bits}
                onBitClick={handleRelatedBitClick}
              />
              
              {learnings.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">No daily learnings found</h3>
                  <p className="text-muted-foreground">
                    {friend.name} hasn't shared any learnings yet.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {selectedBit && (
            <BitDetailModal
              bit={selectedBit}
              isOpen={isModalOpen}
              onClose={handleModalClose}
              onBitUpdated={handleBitUpdated}
            />
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default FriendBits;
