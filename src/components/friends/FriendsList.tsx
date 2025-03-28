
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FriendCard from "./FriendCard";
import { sampleFriends } from "@/data/sampleFriends";
import PointsBadge from "@/components/gamification/PointsBadge";
import { Badge } from "@/components/ui/badge";

// Sample points data for leaderboard
const mockFriendsWithPoints = sampleFriends.map(friend => ({
  ...friend,
  points: Math.floor(Math.random() * 3000) + 100
})).sort((a, b) => b.points - a.points);

const FriendsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState(mockFriendsWithPoints);

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search buddies..."
          className="pl-10 w-full max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Buddies Leaderboard */}
      <div className="bg-muted/20 rounded-lg p-4 border">
        <h3 className="font-medium text-lg mb-4">Buddy Leaderboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockFriendsWithPoints.slice(0, 3).map((friend, index) => (
            <div key={friend.id} className={`flex items-center gap-3 p-3 rounded-lg ${
              index === 0 ? 'bg-amber-100 dark:bg-amber-900/20' : 
              index === 1 ? 'bg-gray-100 dark:bg-gray-800/40' : 
              'bg-orange-50 dark:bg-orange-900/10'
            }`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-bold ${
                index === 0 ? 'bg-amber-500' : 
                index === 1 ? 'bg-gray-500' : 
                'bg-orange-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{friend.name}</div>
                <div className="text-xs text-muted-foreground">{friend.email}</div>
              </div>
              <PointsBadge points={friend.points} size="sm" />
            </div>
          ))}
        </div>
      </div>
      
      {filteredFriends.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No buddies found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try adjusting your search query." 
              : "Add some buddies to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <FriendCard key={friend.id} friend={{...friend, points: friend.points}} isFriend={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
