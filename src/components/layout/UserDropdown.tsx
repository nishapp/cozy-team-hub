
import React from "react";
import { Award, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ProfileAvatar from "@/components/ui/ProfileAvatar";

interface UserDropdownProps {
  isAdmin?: boolean;
}

const UserDropdown = ({ isAdmin }: UserDropdownProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <ProfileAvatar 
            src={user?.user_metadata?.avatar_url} 
            fallbackText={user?.user_metadata?.full_name || user?.email?.split('@')[0]} 
            size="sm"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/profile?tab=badges")}>
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate("/admin")}>
              <Users className="h-4 w-4 mr-2" />
              Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => navigate("/bits")}>
            Bits
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/posts")}>
            Posts
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/friends")}>
            Friends
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
