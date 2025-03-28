
import { useState } from "react";
import { sampleRecommendations } from "@/data/sampleFriends";
import FriendCard from "./FriendCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FriendRecommendations = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState(sampleRecommendations);

  const filteredRecommendations = recommendations.filter(recommendation => 
    recommendation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Suggested for you</h2>
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search users..."
            className="pl-10 w-full max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No recommendations found</h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? "Try adjusting your search query." 
              : "We couldn't find any recommendations for you right now."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecommendations.map((recommendation) => (
            <FriendCard 
              key={recommendation.id} 
              friend={recommendation} 
              isRecommendation={true} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRecommendations;
