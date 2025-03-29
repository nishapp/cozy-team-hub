
import React from 'react';
import { Flame, Award, Star, Ribbon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subDays, isSameDay } from "date-fns";
import { useNavigate } from 'react-router-dom';
import PointsBadge from './PointsBadge';

interface GamificationTopBarProps {
  points: number;
  level: number;
  currentStreak: number;
  badges: any[];
  activityDates: Date[];
}

const GamificationTopBar = ({ 
  points,
  level,
  currentStreak,
  badges,
  activityDates
}: GamificationTopBarProps) => {
  const navigate = useNavigate();
  const today = new Date();
  
  // Get last 5 days (including today)
  const last5Days = Array.from({ length: 5 }, (_, i) => {
    return subDays(today, 4 - i);
  });

  // Check if there's activity on each of the last 5 days
  const activityStatus = last5Days.map(day => {
    return activityDates.some(activityDate => isSameDay(day, activityDate));
  });

  // Function to get different badge icons
  const getBadgeIcon = (index: number) => {
    // Cycle through different badge styles with different colors
    switch (index % 3) {
      case 0:
        return <Ribbon className="h-4 w-4 text-blue-500" />; 
      case 1:
        return <Award className="h-4 w-4 text-indigo-500" />;
      case 2:
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <Award className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="bg-muted/30 p-2 rounded-lg mb-6 flex flex-wrap items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* Streak */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-1">
              <Flame className="text-orange-500 w-5 h-5" />
              <span className="font-medium">{currentStreak}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentStreak} day streak</p>
              <div className="flex items-center gap-1 mt-1">
                {last5Days.map((day, index) => (
                  <div 
                    key={index}
                    className={`w-5 h-5 flex items-center justify-center rounded-full text-xs 
                      ${activityStatus[index] 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-muted/40 text-muted-foreground'
                      }`}
                  >
                    {format(day, 'd')}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Level */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="flex items-center space-x-1">
              <Star className="text-amber-500 w-5 h-5" />
              <span className="font-medium">Level {level}</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>You are Level {level}</p>
              <p className="text-xs text-muted-foreground">
                {points} points total
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Points */}
        <PointsBadge points={points} size="sm" />
      </div>
      
      {/* Badges */}
      <div className="flex items-center">
        <div className="flex -space-x-2 mr-2">
          {badges.slice(0, 3).map((badge, i) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="h-7 w-7 rounded-full bg-blue-900/80 border border-blue-500/50 flex items-center justify-center">
                    {getBadgeIcon(i)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{badge.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        <button 
          onClick={() => navigate('/profile')} 
          className="text-sm text-primary hover:underline"
        >
          View all
        </button>
      </div>
    </div>
  );
};

export default GamificationTopBar;
