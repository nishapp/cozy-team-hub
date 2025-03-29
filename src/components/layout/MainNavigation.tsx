
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FileText, Settings, Users, UserPlus, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import PointsBadge from "@/components/gamification/PointsBadge";

interface MainNavigationProps {
  isAdmin?: boolean;
  userPoints?: number;
}

export function MainNavigation({ isAdmin, userPoints = 0 }: MainNavigationProps) {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Posts",
      href: "/posts",
      icon: FileText,
      requiresAuth: true,
    },
    {
      name: "Buddies",
      href: "/friends",
      icon: UserPlus,
      requiresAuth: true,
    },
    {
      name: "Achievements",
      href: "/profile?tab=badges",
      icon: Award,
      requiresAuth: true,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      requiresAuth: true,
    },
  ];

  if (isAdmin) {
    menuItems.push({
      name: "Admin",
      href: "/admin",
      icon: Users,
      requiresAuth: true,
    });
  }

  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiresAuth || user
  );

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {filteredMenuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          end={item.href === "/"}
          className={({ isActive }) =>
            cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </NavLink>
      ))}
      
      {user && userPoints > 0 && (
        <div className="ml-2">
          <PointsBadge points={userPoints} size="sm" />
        </div>
      )}
    </nav>
  );
}

export default MainNavigation;
