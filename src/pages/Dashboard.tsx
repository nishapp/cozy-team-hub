
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookMarked,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Code,
  Compass,
  Dumbbell,
  FileText,
  Folder,
  Globe,
  Heart,
  Home,
  Library,
  ListTodo,
  MessageSquare,
  Music,
  Plus,
  Share2,
  Smile,
  Tag,
  Thermometer,
  ThumbsUp,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import DailyLearningSection from "@/components/bits/DailyLearningSection";
import FeaturedBits from "@/components/bits/FeaturedBits";
import GamificationTopBar from "@/components/gamification/GamificationTopBar";
import { useAuth } from "@/context/AuthContext";
import UserPointsCard from "@/components/gamification/UserPointsCard";
import SharedBitsCarousel from "@/components/bits/SharedBitsCarousel";
import { toast } from "sonner";
import BitDetailModal from "@/components/bits/BitDetailModal";
import { sampleFriends } from "@/data/sampleFriends";
import BitCard from "@/components/bits/BitCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categoryIcons: Record<string, React.ReactNode> = {
  coding: <Code size={18} />,
  reading: <BookOpen size={18} />,
  wellness: <Thermometer size={18} />,
  hobbies: <Music size={18} />,
  productivity: <ListTodo size={18} />,
  finance: <Globe size={18} />,
  travel: <Compass size={18} />,
  fitness: <Dumbbell size={18} />,
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [progress, setProgress] = useState(67);
  const [currentBit, setCurrentBit] = useState<any | null>(null);
  const [bitDetailOpen, setBitDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-bits");

  // Your bits data
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
      link: "https://www.typescriptlang.org/docs/"
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
      link: "https://reactjs.org/docs/hooks-intro.html"
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
      link: "https://www.mindful.org/meditation/mindfulness-getting-started/"
    },
  ];

  // Friends' bits data
  const sampleFriendBits = [
    {
      id: "friend-bit-1",
      title: "JavaScript Promises Explained",
      description: "A deep dive into JavaScript promises and async/await.",
      tags: ["javascript", "async", "promises"],
      category: "coding",
      visibility: "public",
      image_url: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=350&fit=crop",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      wdylt_comment: "Always remember that .catch() only catches errors in previous promises, not in the .then() that follows it.",
      shared_by: "Sarah Johnson",
      author_avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: "friend-bit-2",
      title: "CSS Grid Layout Tutorial",
      description: "A comprehensive guide to CSS Grid Layout.",
      tags: ["css", "grid", "layout", "web-design"],
      category: "coding",
      visibility: "public",
      image_url: "https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=500&h=350&fit=crop",
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      shared_by: "Mike Chen",
      author_avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: "friend-bit-3",
      title: "Productivity Techniques for Developers",
      description: "Learn how to stay productive as a developer.",
      tags: ["productivity", "techniques", "workflow"],
      category: "health",
      visibility: "public",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      wdylt_comment: "The technique that worked best for me was time-blocking combined with the 2-minute rule.",
      shared_by: "Emily Davis",
      author_avatar: "https://i.pravatar.cc/150?img=3"
    }
  ];

  const [myBits, setMyBits] = useState(sampleBits);
  const [friendsBits, setFriendsBits] = useState(sampleFriendBits);

  // Your daily streak and points data
  const streakData = {
    currentStreak: 5,
    longestStreak: 12,
    weeklyActivity: [3, 5, 2, 4, 5, 1, 0], // Mon-Sun
  };

  // Mock recent activity data
  const recentActivity = [
    {
      id: "1",
      type: "like",
      description: "Mark liked your bit about React hooks",
      time: "10 min ago",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      type: "comment",
      description: "Sarah commented on your reading list",
      time: "2 hours ago",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      type: "share",
      description: "John shared your fitness tips with 5 people",
      time: "Yesterday",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  ];

  // Mock accomplishments data
  const accomplishments = [
    {
      id: "1",
      title: "Consistent Learner",
      description: "Logged learning notes for 5 days straight",
      progress: 100,
    },
    {
      id: "2",
      title: "Bit Creator",
      description: "Create 10 learning bits",
      progress: 70,
    },
    {
      id: "3",
      title: "Social Sharer",
      description: "Share your knowledge with 5 friends",
      progress: 40,
    },
  ];

  // Sample popular categories data
  const popularCategories = [
    { name: "coding", count: 24 },
    { name: "reading", count: 18 },
    { name: "wellness", count: 15 },
    { name: "hobbies", count: 12 },
    { name: "productivity", count: 10 },
  ];

  // Mock feature bit data for demo
  const featuredBit = {
    id: "featured1",
    title: "Understanding TypeScript Generics",
    description:
      "TypeScript generics provide a way to create reusable components that can work with a variety of types rather than a single one. This is similar to generics in other languages like Java or C#.",
    tags: ["typescript", "programming", "web-dev"],
    category: "coding",
    visibility: "public",
    wdylt_comment: "Today I finally understood how to use TypeScript generics properly!",
    image_url: "https://miro.medium.com/max/1200/1*FvOmt7q_BFfRPrNOSmvwVA.png",
    created_at: "2025-03-15T10:00:00Z",
    shared_by: "You",
    link: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
    author_avatar: profile?.avatar_url || undefined,
    friend_count: 3,
  };

  // Sample mock data for featured bits categories
  const categoryImages = [
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2831&q=80",
    "https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2787&q=80",
    "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
    "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2835&q=80",
    "https://images.unsplash.com/photo-1458398421798-821b986a889f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2786&q=80",
  ];

  const categoryTitles = [
    "Technology",
    "Travel",
    "Food & Recipes",
    "Health & Fitness",
    "Art & Design",
    "DIY & Crafts",
  ];

  // Mock data for daily learning
  const learningData = [
    {
      id: "1",
      date: new Date().toISOString(),
      content: "Learned about React's useEffect hook and how to properly clean up side effects",
      tags: ["react", "hooks", "frontend"],
      title: "React Hooks Deep Dive",
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      content: "Explored how TypeScript interfaces can be extended for more flexible type definitions",
      tags: ["typescript", "programming"],
      title: "TypeScript Interface Extensions",
      relatedBitId: "bit123",
    },
  ];

  // Mock data for badges
  const userBadges = [
    { id: "1", name: "Early Adopter" },
    { id: "2", name: "5-Day Streak" },
    { id: "3", name: "Content Creator" },
  ];

  // Mock activity dates
  const activityDates = [
    new Date(),
    new Date(Date.now() - 86400000), // yesterday
    new Date(Date.now() - 86400000 * 3), // 3 days ago
    new Date(Date.now() - 86400000 * 5), // 5 days ago
  ];

  const openBitDetail = (bit: any) => {
    setCurrentBit(bit);
    setBitDetailOpen(true);
  };

  const closeBitDetail = () => {
    setBitDetailOpen(false);
    setCurrentBit(null);
  };

  const handleBitUpdated = (updatedBit: any) => {
    // In a real implementation, this would update the bit in the state or trigger a refetch
    toast.success("Bit updated successfully!");
    // For now, we'll just close the modal
    closeBitDetail();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "share":
        return <Share2 className="h-4 w-4 text-green-500" />;
      default:
        return <ThumbsUp className="h-4 w-4 text-gray-500" />;
    }
  };

  useEffect(() => {
    // Simulate progress increasing over time
    const timer = setTimeout(() => {
      setProgress(Math.min(progress + 1, 100));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [progress]);

  const viewFriendProfile = (friendId: string) => {
    navigate(`/friends/${friendId}`);
  };

  // Calculate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const username = profile?.full_name || "User";

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <span className="text-orange-500 mr-2">
                  <span className="inline-flex items-center justify-center bg-orange-500/20 p-1 rounded-full">
                    <span className="px-2 py-0.5">4</span>
                  </span>
                </span>
                <span className="text-yellow-400 mr-2">
                  <span className="inline-flex items-center justify-center bg-yellow-500/20 p-1 rounded-full">
                    <span className="px-2 py-0.5">Level 4</span>
                  </span>
                </span>
                <span className="text-yellow-400">
                  <span className="inline-flex items-center justify-center bg-orange-500/80 px-2 py-0.5 rounded-full">
                    <span>1,250</span>
                  </span>
                </span>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
              View all
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Reading Board</h1>
              <p className="text-gray-400">{getGreeting()}, {username}. Here are your bits ready to be shared.</p>
              <Button variant="outline" className="mt-4 border-white/20 hover:bg-white/10">
                View board
              </Button>
            </div>
            <Button size="icon" variant="outline" className="rounded-full p-2 border-white/20 hover:bg-white/10">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Carousel */}
      <FeaturedBits images={categoryImages} titles={categoryTitles} />

      {/* Sharable Bits Section */}
      <div className="bg-black text-white py-8 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">My sharable bits</h2>
          <p className="text-gray-400 mb-6">Bits with public visibility that can be shared with others</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {myBits.map(bit => (
              <div 
                key={bit.id} 
                className="rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => openBitDetail({...bit, shared_by: "You", author_avatar: profile?.avatar_url})}
              >
                <div className="h-48 bg-gray-800 relative">
                  {bit.image_url ? (
                    <img 
                      src={bit.image_url} 
                      alt={bit.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-center text-3xl">{bit.category}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Original Dashboard Content - Kept below as requested */}
      <div className="bg-background text-foreground">
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <GamificationTopBar 
            points={1250} 
            level={5} 
            currentStreak={streakData.currentStreak} 
            badges={userBadges} 
            activityDates={activityDates} 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="md:col-span-2 space-y-6">
              {/* What did you learn today section */}
              <DailyLearningSection 
                learnings={learningData}
                friendName={profile?.full_name || "You"}
                friendAvatar={profile?.avatar_url}
                onBitClick={openBitDetail}
              />

              {/* Bits Tabs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Bits Collection</CardTitle>
                    <Button variant="outline" onClick={() => navigate("/bits")}>View All Bits</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="my-bits" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="my-bits">My Bits</TabsTrigger>
                      <TabsTrigger value="friends-bits">Friends' Bits</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="my-bits" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myBits.map(bit => (
                          <BitCard 
                            key={bit.id} 
                            bit={{...bit, shared_by: "You", author_avatar: profile?.avatar_url}}
                            onClick={() => openBitDetail(bit)}
                          />
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="friends-bits" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friendsBits.map(bit => (
                          <BitCard 
                            key={bit.id} 
                            bit={bit}
                            onClick={() => openBitDetail(bit)}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Featured Bit */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Featured Bit</h2>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => openBitDetail(featuredBit)}
                    >
                      View Details
                    </Button>
                  </div>

                  <Card
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openBitDetail(featuredBit)}
                  >
                    {featuredBit.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={featuredBit.image_url}
                          alt={featuredBit.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          {categoryIcons[featuredBit.category.toLowerCase()] || <Tag size={14} />}
                          {featuredBit.category}
                        </Badge>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(featuredBit.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{featuredBit.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-muted-foreground mb-2 line-clamp-3">
                        {featuredBit.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {featuredBit.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm text-muted-foreground">12 likes</span>
                      </div>
                      {featuredBit.friend_count && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm text-muted-foreground">
                            Shared with {featuredBit.friend_count} friends
                          </span>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              </div>

              {/* Shared by Friends Carousel */}
              <SharedBitsCarousel />

              {/* Recent Bits */}
              <FeaturedBits 
                images={categoryImages} 
                titles={categoryTitles} 
              />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* User Points Card */}
              <UserPointsCard 
                userName={profile?.full_name || "User"} 
                userAvatar={profile?.avatar_url} 
                points={1250}
                level={5}
                currentStreak={streakData.currentStreak}
                longestStreak={streakData.longestStreak}
                isCurrentUser={true}
              />

              {/* My Friends Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Buddies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {sampleFriends.slice(0, 3).map((friend) => (
                      <div 
                        key={friend.id} 
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => viewFriendProfile(friend.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback>
                            {friend.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{friend.name}</p>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {Math.floor(Math.random() * 20) + 1} bits
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/friends/${friend.id}`);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    size="sm"
                    onClick={() => navigate("/friends")}
                  >
                    View all buddies
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 pb-3 border-b last:border-0 last:pb-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <p className="text-sm font-medium">{activity.description}</p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" size="sm">
                    View all activity
                  </Button>
                </CardFooter>
              </Card>

              {/* Popular Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {popularCategories.map((category) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between pb-2 last:pb-0"
                    >
                      <div className="flex items-center">
                        {categoryIcons[category.name] || <Folder className="h-4 w-4 mr-2" />}
                        <span className="ml-2 capitalize">{category.name}</span>
                      </div>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" size="sm" onClick={() => navigate("/bits")}>
                    View all categories
                  </Button>
                </CardFooter>
              </Card>

              {/* Accomplishments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Accomplishments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {accomplishments.map((accomplishment) => (
                    <div key={accomplishment.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{accomplishment.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {accomplishment.progress}%
                        </span>
                      </div>
                      <Progress value={accomplishment.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {accomplishment.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" size="sm">
                    View all achievements
                  </Button>
                </CardFooter>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/")}
                  >
                    <Home className="mr-2 h-4 w-4" /> Home
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/bookmarks")}
                  >
                    <BookMarked className="mr-2 h-4 w-4" /> Bookmarks
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/bits")}
                  >
                    <FileText className="mr-2 h-4 w-4" /> My Bits
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/friends")}
                  >
                    <Users className="mr-2 h-4 w-4" /> Friends
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => navigate("/settings")}
                  >
                    <Library className="mr-2 h-4 w-4" /> Library
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {currentBit && (
            <BitDetailModal
              bit={currentBit}
              isOpen={bitDetailOpen}
              onClose={closeBitDetail}
              onBitUpdated={handleBitUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
