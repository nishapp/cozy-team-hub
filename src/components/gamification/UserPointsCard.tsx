
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Star, Zap } from "lucide-react";

interface UserPointsCardProps {
  userName: string;
  userAvatar?: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  isCurrentUser?: boolean;
}

const UserPointsCard = ({
  userName,
  userAvatar,
  points,
  level,
  currentStreak,
  longestStreak,
  isCurrentUser = false,
}: UserPointsCardProps) => {
  // Calculate progress to next level (each level needs level * 100 points)
  const nextLevelThreshold = level * 100;
  const currentLevelThreshold = (level - 1) * 100;
  const pointsInCurrentLevel = points - currentLevelThreshold;
  const progressToNextLevel = Math.min(
    Math.floor((pointsInCurrentLevel / (nextLevelThreshold - currentLevelThreshold)) * 100),
    100
  );

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-muted/20 to-muted shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2 pt-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg flex items-center gap-1">
                {userName}
                {isCurrentUser && (
                  <Badge variant="outline" className="ml-2 text-xs font-normal">
                    You
                  </Badge>
                )}
              </CardTitle>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Level {level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">Points</div>
          <div className="text-sm font-medium">{points} / {nextLevelThreshold}</div>
        </div>
        <Progress value={progressToNextLevel} className="h-2 mb-4" />
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-1 text-primary">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold">{currentStreak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-3">
            <div className="flex items-center justify-center mb-1 text-primary">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold">{longestStreak}</div>
            <div className="text-xs text-muted-foreground">Longest Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserPointsCard;
