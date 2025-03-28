
import { Award, Info, Shield } from "lucide-react";
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
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-primary/10">
                              <Shield className="h-6 w-6 text-primary" />
                            </div>
                          )}
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
