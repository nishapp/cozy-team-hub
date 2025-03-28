
import { Award, Info, Shield, UserPlus, Zap, BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  pointsReward: number;
  earnedAt?: string;
}

interface BadgesDisplayProps {
  badges: Badge[];
  title?: string;
  className?: string;
  showEmptyState?: boolean;
}

const BadgesDisplay = ({
  badges,
  title = "Earned Badges",
  className = "",
  showEmptyState = true,
}: BadgesDisplayProps) => {
  // Function to get the appropriate icon based on badge name
  const getBadgeIcon = (badgeName: string) => {
    const name = badgeName.toLowerCase();
    if (name.includes('newcomer') || name.includes('new')) {
      return <Zap className="h-6 w-6 text-primary" />;
    } else if (name.includes('consistency') || name.includes('streak') || name.includes('dedicated')) {
      return <Award className="h-6 w-6 text-primary" />;
    } else if (name.includes('buddy') || name.includes('network') || name.includes('social')) {
      return <UserPlus className="h-6 w-6 text-primary" />;
    } else if (name.includes('book') || name.includes('read')) {
      return <BookOpen className="h-6 w-6 text-primary" />;
    } else {
      return <Shield className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <Award className="mr-2 h-5 w-5 text-primary" />
          {title}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm max-w-xs">
                Earn badges by creating bits, maintaining streaks, and connecting with buddies.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {badges.length > 0 ? (
        <ScrollArea className="h-32 whitespace-nowrap rounded-md border">
          <div className="flex p-4 gap-4">
            {badges.map((badge) => (
              <TooltipProvider key={badge.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center w-16">
                      <div className="w-12 h-12 mb-1 relative">
                        <AspectRatio ratio={1 / 1} className="bg-muted rounded-md overflow-hidden">
                          {badge.imageUrl ? (
                            <img
                              src={badge.imageUrl}
                              alt={badge.name}
                              className="object-cover"
                              onError={(e) => {
                                // Properly type the event target as HTMLImageElement
                                const img = e.currentTarget as HTMLImageElement;
                                img.style.display = 'none';
                                // Use type assertion to tell TypeScript this is an HTMLElement
                                const parent = img.parentElement as HTMLElement;
                                const fallbackIcon = parent.querySelector('.fallback-icon') as HTMLElement;
                                if (fallbackIcon) {
                                  fallbackIcon.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`fallback-icon h-full w-full flex items-center justify-center bg-primary/10 ${badge.imageUrl ? 'hidden' : 'flex'}`}
                          >
                            {getBadgeIcon(badge.name)}
                          </div>
                        </AspectRatio>
                      </div>
                      <span className="text-xs font-medium text-center">
                        {badge.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-2 max-w-xs">
                      <p className="font-medium">{badge.name}</p>
                      <p className="text-sm">{badge.description}</p>
                      <p className="text-xs text-muted-foreground">
                        +{badge.pointsReward} points
                      </p>
                      {badge.earnedAt && (
                        <p className="text-xs text-muted-foreground">
                          Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </ScrollArea>
      ) : showEmptyState ? (
        <div className="flex flex-col items-center justify-center h-32 border rounded-md bg-muted/10 p-4">
          <Award className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            No badges earned yet. Keep creating content to earn your first badge!
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default BadgesDisplay;
