
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Trophy, Flame } from "lucide-react";
import PointsBadge from './PointsBadge';
import StreakDisplay from './StreakDisplay';

interface GamificationTopBarProps {
  points: number;
  streak: number;
}

const GamificationTopBar: React.FC<GamificationTopBarProps> = ({ points, streak }) => {
  return (
    <div className="w-full bg-primary/5 dark:bg-primary/10">
      <div className="container flex items-center justify-center sm:justify-end py-2 px-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <Trophy className="h-4 w-4 text-amber-500 mr-2" />
            <span className="text-sm font-medium mr-1.5">Points:</span>
            <PointsBadge points={points} size="sm" />
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center">
            <Flame className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm font-medium mr-1.5">Streak:</span>
            <StreakDisplay days={streak} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationTopBar;
