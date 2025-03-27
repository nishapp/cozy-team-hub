
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  src?: string | null;
  fallbackText?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const ProfileAvatar = ({ 
  src, 
  fallbackText, 
  className,
  size = "md" 
}: ProfileAvatarProps) => {
  const { user } = useAuth();
  
  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || "?";
    
    return name
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .join("") || user?.email?.charAt(0).toUpperCase() || "?";
  };
  
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  };
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={src || undefined} alt="Profile" />
      <AvatarFallback className="bg-primary/10 text-primary">
        {fallbackText ? getInitials(fallbackText) : <User className="h-5 w-5" />}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileAvatar;
