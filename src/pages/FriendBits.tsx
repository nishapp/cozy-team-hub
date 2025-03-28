
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import BitCard from "@/components/bits/BitCard";
import BitDetailModal from "@/components/bits/BitDetailModal";
import { Calendar, User, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sampleFriends } from "@/data/sampleFriends";
import { toast } from "sonner";

// For demo purposes, let's create some sample bits for friends
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

const FriendBits = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [friend, setFriend] = useState<any>(null);
  const [bits, setBits] = useState(sampleFriendBits);
  const [loading, setLoading] = useState(true);
  const [selectedBit, setSelectedBit] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (friendId) {
      // In a real application, we would fetch the friend from the API
      const foundFriend = sampleFriends.find(f => f.id === friendId);
      setFriend(foundFriend);
      
      // In a real application, we would fetch the bits from the API
      // For now, we'll just use our sample data
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

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleBitUpdated = (updatedBit: any) => {
    // Update the bit in the bits array
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
          {/* Friend Profile Header */}
          <div className="bg-card rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <ProfileAvatar 
                src={friend.avatar_url} 
                fallbackText={friend.name}
                size="xl"
                className="border-4 border-background"
              />
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-3xl font-bold">{friend.name}</h1>
                  <div className="flex items-center justify-center md:justify-start mt-2 text-muted-foreground">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>{friend.email}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {formatDistanceToNow(new Date(friend.joined_date), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {friend.mutual_friends > 0 && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{friend.mutual_friends} mutual friends</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Friend's Bits */}
          <div>
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
          </div>
          
          {/* Bit Detail Modal */}
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
