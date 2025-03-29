
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import SharedBitsCarousel from "@/components/bits/SharedBitsCarousel";
import FeaturedBits from "@/components/bits/FeaturedBits";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DailyLearningSection from "@/components/bits/DailyLearningSection";
import HeaderAddBitButton from "@/components/bits/HeaderAddBitButton";
import TopBuddiesSection from "@/components/friends/TopBuddiesSection";
import GamificationTopBar from "@/components/gamification/GamificationTopBar";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [recentSharedBits, setRecentSharedBits] = useState([]);
  const [activeTab, setActiveTab] = useState("featured");
  const [userPoints, setUserPoints] = useState(0);
  const [streak, setStreak] = useState(0);

  // Sample feature image data
  const featureImages = [
    "https://images.unsplash.com/photo-1581276879432-15e50529f34b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  ];

  const featureTitles = ["Development", "Design", "Marketing", "Data Science", "Business", "AI"];

  // Sample daily learning data
  const sampleLearnings = [
    {
      id: "1",
      title: "JavaScript Promises",
      description: "Learn how to use promises to handle asynchronous operations effectively.",
      link: "/bit/1",
      completed: true,
      imageUrl: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "2",
      title: "CSS Grid Layouts",
      description: "Master CSS Grid for responsive web design.",
      link: "/bit/2",
      completed: false,
      imageUrl: "https://images.unsplash.com/photo-1583339793403-3d9b001b6008?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "3",
      title: "React Hooks",
      description: "Understand how to use React hooks for state management and side effects.",
      link: "/bit/3",
      completed: false,
      imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Sample buddy data
  const sampleBuddies = [
    {
      id: "1",
      name: "Alex Johnson",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: "2",
      name: "Maria Rodriguez",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: "3",
      name: "David Kim",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      id: "4",
      name: "Sophie Chen",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg"
    },
    {
      id: "5",
      name: "Raj Patel",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg"
    }
  ];

  useEffect(() => {
    const fetchSharedBits = async () => {
      // This would be replaced with a real API call to get bits shared by friends
      try {
        // Simulated data for now
        const sharedBits = [
          {
            id: "1",
            title: "React Performance Optimization Techniques",
            description: "Learn how to optimize your React applications with these proven techniques.",
            image_url: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            tags: ["react", "performance", "javascript"],
            category: "Development",
            visibility: "public",
            created_at: new Date().toISOString(),
            shared_by: "Alex Johnson",
            author_avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            friend_count: 3
          },
          {
            id: "2",
            title: "CSS Grid vs Flexbox: When to Use Each",
            description: "A comprehensive comparison of CSS Grid and Flexbox with practical examples.",
            tags: ["css", "layout", "frontend"],
            category: "Design",
            visibility: "public",
            created_at: new Date().toISOString(),
            shared_by: "Maria Rodriguez",
            author_avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            friend_count: 5
          },
          {
            id: "3",
            title: "Building a RESTful API with Node.js and Express",
            description: "Step-by-step guide to create a robust RESTful API using Node.js and Express.",
            image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            tags: ["nodejs", "express", "api"],
            category: "Backend",
            visibility: "public",
            created_at: new Date().toISOString(),
            shared_by: "David Kim",
            author_avatar: "https://randomuser.me/api/portraits/men/22.jpg",
            friend_count: 2
          },
          {
            id: "4",
            title: "Introduction to TypeScript for JavaScript Developers",
            description: "Learn how TypeScript can improve your JavaScript development experience.",
            tags: ["typescript", "javascript", "webdev"],
            category: "Development",
            visibility: "public",
            created_at: new Date().toISOString(),
            shared_by: "Sophie Chen",
            author_avatar: "https://randomuser.me/api/portraits/women/28.jpg",
            friend_count: 7
          }
        ];
        
        setRecentSharedBits(sharedBits);
      } catch (error) {
        console.error("Error fetching shared bits:", error);
      }
    };

    const fetchUserStats = async () => {
      if (!user) return;

      try {
        // This would be replaced with a real API call to get user points and streak
        // For now, using mock data
        
        // Simulate API call delay
        setTimeout(() => {
          setUserPoints(350);
          setStreak(4);
        }, 500);
        
        // In real implementation, we would fetch from Supabase:
        // const { data, error } = await supabase
        //   .from('user_stats')
        //   .select('points, streak')
        //   .eq('user_id', user.id)
        //   .single();
        
        // if (error) throw error;
        // if (data) {
        //   setUserPoints(data.points);
        //   setStreak(data.streak);
        // }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchSharedBits();
    fetchUserStats();
  }, [user]);

  if (!user && !loading) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handler for when a bit is added
  const handleBitAdded = (bit) => {
    console.log("New bit added:", bit);
    // In a real app, we would update the state or refetch data
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <GamificationTopBar points={userPoints} streak={streak} />
          
          <div className="container py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Track your bits, view what your friends are sharing, and continue your learning journey.
                </p>
              </div>
              <HeaderAddBitButton onBitAdded={handleBitAdded} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Tabs defaultValue="featured" onValueChange={setActiveTab} className="mb-8">
                  <TabsList>
                    <TabsTrigger value="featured">Featured</TabsTrigger>
                    <TabsTrigger value="daily">Daily Learning</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="featured" className="space-y-8 mt-6">
                    <FeaturedBits images={featureImages} titles={featureTitles} />
                    <SharedBitsCarousel sharedBits={recentSharedBits} />
                  </TabsContent>
                  
                  <TabsContent value="daily" className="mt-6">
                    <DailyLearningSection learnings={sampleLearnings} friendName="You" />
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="lg:col-span-1">
                <TopBuddiesSection buddies={sampleBuddies} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
