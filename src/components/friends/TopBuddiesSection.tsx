
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users } from 'lucide-react';

interface Buddy {
  id: string;
  name: string;
  avatar?: string;
  topBit?: {
    id: string;
    title: string;
    image_url?: string;
  };
}

interface TopBuddiesSectionProps {
  buddies: Buddy[];
}

const TopBuddiesSection: React.FC<TopBuddiesSectionProps> = ({ buddies }) => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full md:w-1/3 lg:w-1/4 pl-0 md:pl-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Top Buddies</h2>
        <p className="text-muted-foreground">Your most active connections</p>
      </div>
      
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {buddies.slice(0, 5).map((buddy) => (
            <div key={buddy.id} className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={buddy.avatar} alt={buddy.name} />
                <AvatarFallback>{buddy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{buddy.name}</p>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={() => navigate('/friends')}
          >
            <Users className="h-4 w-4 mr-2" />
            View all buddies
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TopBuddiesSection;
