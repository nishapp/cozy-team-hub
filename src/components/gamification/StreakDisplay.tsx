
import { CalendarDays, Check, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subDays, isSameDay } from "date-fns";

interface StreakDisplayProps {
  currentStreak: number;
  activityDates: Date[];
  className?: string;
}

const StreakDisplay = ({ 
  currentStreak, 
  activityDates,
  className 
}: StreakDisplayProps) => {
  const today = new Date();
  
  // Get last 7 days (including today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    return subDays(today, 6 - i);
  });

  // Check if there's activity on each of the last 7 days
  const activityStatus = last7Days.map(day => {
    return activityDates.some(activityDate => isSameDay(day, activityDate));
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center mb-2">
        <Flame className="text-orange-500 w-5 h-5 mr-1" />
        <span className="text-sm font-medium mr-1">Streak:</span>
        <Badge variant="secondary" className="font-bold">
          {currentStreak} days
        </Badge>
      </div>
      
      <div className="flex items-center justify-center gap-1 mt-1">
        <TooltipProvider>
          {last7Days.map((day, index) => (
            <Tooltip key={index}>
              <TooltipTrigger>
                <div 
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs 
                    ${activityStatus[index] 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-muted/40 text-muted-foreground'
                    }`}
                >
                  {activityStatus[index] 
                    ? <Check className="w-4 h-4" /> 
                    : format(day, 'd')}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p>{format(day, 'EEEE, MMM d')}</p>
                  {activityStatus[index] 
                    ? <p className="text-green-600 dark:text-green-400">Activity recorded</p>
                    : <p className="text-muted-foreground">No activity</p>
                  }
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default StreakDisplay;
