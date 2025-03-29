
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookMarked,
  BookOpen,
  Calendar,
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
  const { user } = useAuth();
  const [progress, setProgress] = useState(67);
  const [currentBit, setCurrentBit] = useState<any | null>(null);
  const [bitDetailOpen, setBitDetailOpen] = useState(false);

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
    author_avatar: user?.avatar_url || undefined,
    friend_count: 3,
  };

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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <GamificationTopBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* What did you learn today section */}
          <DailyLearningSection />

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
          <FeaturedBits />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* User Points Card */}
          <UserPointsCard />

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
  );
};

export default Dashboard;
