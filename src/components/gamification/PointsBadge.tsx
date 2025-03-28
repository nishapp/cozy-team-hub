
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsBadgeProps {
  points: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const PointsBadge = ({ 
  points, 
  size = "md", 
  className,
  animate = false
}: PointsBadgeProps) => {
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-1 rounded-full font-medium",
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
        animate && "animate-pulse",
        sizeClasses[size],
        className
      )}
    >
      <Star className={iconSizes[size]} />
      <span>{points.toLocaleString()}</span>
    </div>
  );
};

export default PointsBadge;
