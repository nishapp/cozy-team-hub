
import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FileText, Home, LayoutDashboard, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function MainNavigation() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const menuItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      requiresAuth: false,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      requiresAuth: true,
    },
    {
      name: "Posts",
      href: "/posts",
      icon: FileText,
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
    </nav>
  );
}

export default MainNavigation;
