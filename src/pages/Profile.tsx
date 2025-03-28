
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import UserPointsCard from "@/components/gamification/UserPointsCard";
import BadgesDisplay from "@/components/gamification/BadgesDisplay";
import StreakDisplay from "@/components/gamification/StreakDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, Bookmark, Clock, Edit, User } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [fullName, setFullName] = useState<string>("");
  // Sample gamification data - would be fetched from API in a real app
  const [points, setPoints] = useState(1250);
  const [level, setLevel] = useState(4);
  const [currentStreak, setCurrentStreak] = useState(4);
  const [longestStreak, setLongestStreak] = useState(10);
  const [activityDates, setActivityDates] = useState([
    new Date(),
    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  ]);
  const [badges, setBadges] = useState([
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
  ]);

  useEffect(() => {
    if (user) {
      setFullName(user.email?.split('@')[0] || "User");
    }
  }, [user]);

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

  const handleUpdateProfile = () => {
    toast.success("Profile updated successfully!");
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile sidebar */}
            <div className="w-full md:w-1/3">
              <UserPointsCard 
                userName={fullName || user?.email?.split('@')[0] || "User"}
                userAvatar={user?.user_metadata?.avatar_url}
                points={points}
                level={level}
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                isCurrentUser={true}
              />
              
              <div className="mt-6">
                <StreakDisplay 
                  currentStreak={currentStreak}
                  activityDates={activityDates}
                  className="mb-4"
                />
              </div>
            </div>
            
            {/* Main content area */}
            <div className="w-full md:w-2/3">
              <Tabs defaultValue="badges" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="badges" className="flex items-center gap-2">
                    <Award className="h-4 w-4" /> Badges
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Activity
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="badges" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Award className="mr-2 h-5 w-5 text-primary" />
                        My Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BadgesDisplay 
                        badges={badges}
                        title="All Earned Badges"
                        className="mb-4"
                        showEmptyState={true}
                      />
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Award className="mr-2 h-5 w-5 text-primary" />
                          Available Badges
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <div className="flex gap-3 items-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bookmark className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Bookworm</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Bookmark 20 bits
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="text-xs text-muted-foreground flex justify-between mb-1">
                                  <span>Progress</span>
                                  <span>12/20</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-muted/30">
                            <CardContent className="p-4">
                              <div className="flex gap-3 items-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Award className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium">Dedicated Learner</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Maintain a 7-day streak
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="text-xs text-muted-foreground flex justify-between mb-1">
                                  <span>Progress</span>
                                  <span>4/7</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: '57%' }}></div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        Profile Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center mb-6 p-4">
                        <div className="relative mb-4">
                          <Avatar className="h-24 w-24 border-4 border-primary/20">
                            <AvatarImage src={user?.user_metadata?.avatar_url} alt={fullName} />
                            <AvatarFallback className="text-2xl">
                              {fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Button size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <h2 className="text-xl font-bold">{fullName}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            placeholder="Your full name" 
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            placeholder="Your email" 
                            value={user?.email || ''} 
                            disabled
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input 
                            id="bio" 
                            placeholder="Tell us about yourself" 
                          />
                        </div>
                        
                        <Button onClick={handleUpdateProfile}>
                          Update Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="activity" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-primary" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              {i % 3 === 0 ? (
                                <Bookmark className="h-5 w-5 text-primary" />
                              ) : i % 3 === 1 ? (
                                <Award className="h-5 w-5 text-primary" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {i % 3 === 0 
                                  ? 'Created a new bit' 
                                  : i % 3 === 1 
                                  ? 'Earned a badge' 
                                  : 'Connected with a buddy'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {i === 0 
                                  ? 'Today' 
                                  : i === 1 
                                  ? 'Yesterday' 
                                  : `${i} days ago`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Profile;
