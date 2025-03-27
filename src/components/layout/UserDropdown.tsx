
import { Link } from "react-router-dom";
import { Menu, Mail, Settings, Shield, Building2, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ProfileAvatar from "@/components/ui/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface UserDropdownProps {
  user: User | null;
  profileData: {
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
  } | null;
  signOut: () => void;
}

const UserDropdown = ({ user, profileData, signOut }: UserDropdownProps) => {
  const isAdmin = profileData?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full p-0">
          <ProfileAvatar src={profileData?.avatar_url} fallbackText={profileData?.full_name} size="sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <ProfileAvatar src={profileData?.avatar_url} fallbackText={profileData?.full_name} size="sm" />
          <div className="flex flex-col space-y-0.5 leading-none">
            {profileData?.full_name && <p className="font-medium text-sm">{profileData.full_name}</p>}
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer w-full flex items-center">
            <Menu size={16} className="mr-2" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contact" className="cursor-pointer w-full flex items-center">
            <Mail size={16} className="mr-2" />
            <span>Contact</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer w-full flex items-center">
                <Shield size={16} className="mr-2" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/company-settings" className="cursor-pointer w-full flex items-center">
                <Building2 size={16} className="mr-2" />
                <span>Company Settings</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer w-full flex items-center">
            <Settings size={16} className="mr-2" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-red-600 cursor-pointer">
          <LogOut size={16} className="mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
