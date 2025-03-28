import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import BitCard from "@/components/bits/BitCard";
import BitDetailModal from "@/components/bits/BitDetailModal";
import DailyLearningSection from "@/components/bits/DailyLearningSection";
import { Calendar, User, Mail, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { sampleFriends } from "@/data/sampleFriends";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Glow } from "@/components/ui/glow";
import UserPointsCard from "@/components/gamification/UserPointsCard";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import { BookmarkItem, BookmarkFolder } from "@/types/bookmark";
import { Card } from "@/components/ui/card";
import { initialBookmarksData } from "@/data/initialBookmarks";

const sampleFriendBits = [
  {
    id: "bit-1",
    title: "JavaScript Promises Explained",
    description: "A deep dive into JavaScript promises and async/await. Learn how promises work behind the scenes and how to use them effectively in your code.",
    tags: ["javascript", "async", "promises"],
    category: "coding",
    visibility: "public",
    image_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=350&fit=crop",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    wdylt_comment: "Always remember that .catch() only catches errors in previous promises, not in the .then() that follows it."
  },
  {
    id: "bit-2",
    title: "React Hooks Best Practices",
    description: "Tips and tricks for using React hooks effectively. Learn about dependency arrays, custom hooks, and common pitfalls to avoid.",
    tags: ["react", "hooks", "javascript", "frontend"],
    category: "coding",
    visibility: "public",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "bit-3",
    title: "CSS Grid Layout Tutorial",
    description: "A comprehensive guide to CSS Grid Layout. Learn how to create complex layouts with just a few lines of CSS.",
    tags: ["css", "grid", "layout", "web-design"],
    category: "coding",
    visibility: "public",
    image_url: "https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=500&h=350&fit=crop",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "bit-4",
    title: "Productivity Techniques for Developers",
    description: "Learn how to stay productive as a developer. Techniques include Pomodoro, time-blocking, and effective note-taking.",
    tags: ["productivity", "techniques", "workflow"],
    category: "health",
    visibility: "public",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    wdylt_comment: "The technique that worked best for me was time-blocking combined with the 2-minute rule."
  }
];

const sampleDailyLearnings = [
  {
    id: "learning-1",
    date: new Date().toISOString(),
    content: "Learned about React Context API and how to use it for global state management.",
    tags: ["react", "context-api", "state-management"],
    title: "React Context API",
    relatedBitId: "bit-2"
  },
  {
    id: "learning-2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Discovered a great technique for debugging complex JavaScript promises using async/await and try/catch blocks.",
    tags: ["javascript", "debugging", "promises"],
    title: "Debugging Promises",
    relatedBitId: "bit-1"
  },
  {
    id: "learning-3",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Learned about CSS custom properties (variables) and how they can be changed dynamically with JavaScript.",
    tags: ["css", "variables", "javascript"],
    title: "CSS Custom Properties",
    externalUrl: "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties"
  },
  {
    id: "learning-4",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    content: "Learned how to structure large React applications using feature-based organization instead of type-based.",
    tags: ["react", "architecture", "organization"],
    title: "React Project Structure"
  }
];

const sampleBadges = [
  {
    id: "1",
    name: "Newcomer",
    description: "Created your first bit",
    imageUrl: null,
    pointsReward: 50,
    earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Consistency",
    description: "Maintained a 3-day streak",
    imageUrl: null,
    pointsReward: 75,
    earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Buddy Network",
    description: "Connected with 5 buddies",
    imageUrl: null,
    pointsReward: 100,
    earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const sampleActivityDates = [
  new Date(),
  new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
];

const sampleSharedBookmarks: BookmarkItem[] = [
  {
    id: "shared-bookmark-1",
    title: "React Performance Optimization",
    url: "https://reactjs.org/docs/optimizing-performance.html",
    description: "Official guide on optimizing performance in React applications",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: false,
    tags: ["react", "performance", "frontend"]
  },
  {
    id: "shared-bookmark-2",
    title: "JavaScript Event Loop Explained",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop",
    description: "Deep dive into how the JavaScript event loop works",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: false,
    tags: ["javascript", "event-loop", "asynchronous"]
  },
  {
    id: "shared-bookmark-3",
    title: "CSS Grid Layout Guide",
    url: "https://css-tricks.com/snippets/css/complete-guide-grid/",
    description: "A comprehensive guide to CSS Grid Layout",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isPrivate: false,
    tags: ["css", "grid", "layout"]
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
  const [points, setPoints] = useState(750);
  const [level, setLevel] = useState(3);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [longestStreak, setLongestStreak] = useState(7);
  const [badges, setBadges] = useState(sampleBadges);
  const [activityDates, setActivityDates] = useState(sampleActivityDates);
  const [sharedBookmarks, setSharedBookmarks] = useState(sampleSharedBookmarks);

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
          <h1 className="text-2xl font-bold mb-2">Bit Buddy Not Found</h1>
          <p className="text-muted-foreground">The buddy you're looking for doesn't exist or isn't accessible.</p>
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
                        <span className="text-sm text-white">{friend.mutual_friends} mutual buddies</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <UserPointsCard 
                userName={friend.name}
                userAvatar={friend.avatar_url}
                points={points}
                level={level}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
              />
            </div>
            <div className="bg-muted/10 rounded-xl p-6 flex flex-col justify-center">
              <StreakDisplay 
                currentStreak={currentStreak}
                activityDates={activityDates}
                className="mb-4"
              />
              <BadgesDisplay 
                badges={badges}
                title="Recent Badges"
              />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-muted/60 backdrop-blur-sm">
              <TabsTrigger value="bits">Bits</TabsTrigger>
              <TabsTrigger value="learnings">Daily Learnings</TabsTrigger>
              <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
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

            <TabsContent value="bookmarks" className="animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{friend.name}'s Shared Bookmarks</h2>
                </div>
                
                {sharedBookmarks.length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">No bookmarks found</h3>
                    <p className="text-muted-foreground">
                      {friend.name} hasn't shared any bookmarks yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sharedBookmarks.map(bookmark => (
                      <Card key={bookmark.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <a 
                                href={bookmark.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-lg font-medium hover:text-primary transition-colors"
                              >
                                {bookmark.title}
                              </a>
                              <p className="text-sm text-muted-foreground truncate max-w-xl">
                                {bookmark.description || bookmark.url}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <a 
                                href={bookmark.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                              >
                                <Bookmark className="h-5 w-5" />
                              </a>
                            </div>
                          </div>
                          
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {bookmark.tags.map(tag => (
                                <span 
                                  key={tag} 
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            Shared {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
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
