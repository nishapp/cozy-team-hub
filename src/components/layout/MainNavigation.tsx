
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  User, 
  Newspaper, 
  Users, 
  LucideIcon, 
  LayoutDashboard, 
  Bookmark
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  isAdmin?: boolean;
};

export default function MainNavigation({ className }: { className?: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        // You would check if user is admin from your auth system
        // For now we'll just mock this
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user]);

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Bits",
      href: "/bits",
      icon: Home,
    },
    {
      title: "Posts",
      href: "/posts",
      icon: Newspaper,
    },
    {
      title: "Friends",
      href: "/friends",
      icon: Users,
    },
    {
      title: "Bookmarks",
      href: "/bookmarks",
      icon: Bookmark,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "Admin",
      href: "/admin",
      icon: User,
      isAdmin: true,
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.isAdmin || (item.isAdmin && isAdmin)
  );

  return (
    <nav className={cn("p-1", className)}>
      <ul className="flex flex-col gap-1">
        {filteredNavItems.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className={cn(
                "group flex items-center justify-center xl:justify-start gap-x-3 p-3 text-sm font-medium rounded-md transition-all dark:hover:text-white",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/90"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden xl:inline">{item.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
