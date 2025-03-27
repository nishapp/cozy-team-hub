
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useOrganization } from "../../hooks/useOrganization";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { organizations, currentOrganization, switchOrganization } = useOrganization();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <span className="font-semibold hidden md:inline-block">SaaS Starter</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="md:hidden p-2"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary smooth-transition">
            Dashboard
          </Link>
          <Link to="/organization" className="text-sm font-medium hover:text-primary smooth-transition">
            Organization
          </Link>
          <Link to="/team" className="text-sm font-medium hover:text-primary smooth-transition">
            Team
          </Link>
          <Link to="/settings" className="text-sm font-medium hover:text-primary smooth-transition">
            Settings
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Organization selector */}
          {organizations.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="hidden md:flex"
                >
                  {currentOrganization?.name || "Select Organization"}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {organizations.map((org) => (
                  <DropdownMenuItem 
                    key={org.id}
                    onClick={() => switchOrganization(org.id)}
                    className={org.id === currentOrganization?.id ? "bg-accent text-accent-foreground" : ""}
                  >
                    {org.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <User size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
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
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link 
              to="/dashboard" 
              className="block py-2 text-sm font-medium"
              onClick={toggleMobileMenu}
            >
              Dashboard
            </Link>
            <Link 
              to="/organization" 
              className="block py-2 text-sm font-medium"
              onClick={toggleMobileMenu}
            >
              Organization
            </Link>
            <Link 
              to="/team" 
              className="block py-2 text-sm font-medium"
              onClick={toggleMobileMenu}
            >
              Team
            </Link>
            <Link 
              to="/settings" 
              className="block py-2 text-sm font-medium"
              onClick={toggleMobileMenu}
            >
              Settings
            </Link>

            {/* Organization selector on mobile */}
            {organizations.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Switch Organization</p>
                <div className="space-y-1">
                  {organizations.map((org) => (
                    <Button 
                      key={org.id}
                      variant="ghost" 
                      size="sm"
                      className={`w-full justify-start ${org.id === currentOrganization?.id ? "bg-accent text-accent-foreground" : ""}`}
                      onClick={() => {
                        switchOrganization(org.id);
                        toggleMobileMenu();
                      }}
                    >
                      {org.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
