
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FriendCard from "./FriendCard";
import { sampleFriends } from "@/data/sampleFriends";

const FriendsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState(sampleFriends);

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
            <FriendCard key={friend.id} friend={friend} isFriend={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
