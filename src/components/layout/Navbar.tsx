
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Settings, Shield, X, Mail, Building2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import ProfileAvatar from "../ui/ProfileAvatar";

type CompanyInfo = {
  id: string;
  name: string;
  logo_url: string | null;
};

const Navbar = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<{
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
  } | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Fetch company info
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("company")
          .select("id, name, logo_url")
          .single();

        if (error) throw error;
        setCompanyInfo(data);
      } catch (error) {
        console.error("Error fetching company info:", error);
      }
    };

    fetchCompanyInfo();
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const {
          data,
          error
        } = await supabase.from('profiles').select('full_name, avatar_url, role').eq('id', user.id).single();
        if (error) throw error;
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, [user]);
  
  const isAdmin = profileData?.role === 'admin';
  
  if (!user) return null;
  
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center space-x-2">
            {companyInfo?.logo_url ? (
              <img 
                src={`${supabase.storageUrl}/object/public/company_logos/${companyInfo.logo_url}`} 
                alt={`${companyInfo?.name || 'Company'} logo`}
                className="h-8 w-auto"
              />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold">{companyInfo?.name?.charAt(0) || "S"}</span>
              </div>
            )}
            <span className="font-semibold hidden md:inline-block">{companyInfo?.name || "SaaS Starter"}</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2" onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium">
            Dashboard
          </Link>
          <Link to="/contact" className="text-sm font-medium flex items-center gap-1">
            <Mail size={16} />
            Contact
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin" className="text-sm font-medium flex items-center gap-1">
                <Shield size={16} />
                Admin
              </Link>
              <Link to="/company-settings" className="text-sm font-medium flex items-center gap-1">
                <Building2 size={16} />
                Company
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* User menu */}
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
                  <p className="text-xs text-muted-foreground">{user.email}</p>
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
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link to="/dashboard" className="block py-2 text-sm font-medium" onClick={toggleMobileMenu}>
              Dashboard
            </Link>
            <Link to="/contact" className="block py-2 text-sm font-medium" onClick={toggleMobileMenu}>
              Contact
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" className="block py-2 text-sm font-medium flex items-center gap-1" onClick={toggleMobileMenu}>
                  <Shield size={16} />
                  Admin Dashboard
                </Link>
                <Link to="/company-settings" className="block py-2 text-sm font-medium flex items-center gap-1" onClick={toggleMobileMenu}>
                  <Building2 size={16} />
                  Company Settings
                </Link>
              </>
            )}
            <Link to="/settings" className="block py-2 text-sm font-medium" onClick={toggleMobileMenu}>
              Settings
            </Link>
          </div>
        </div>}
    </header>;
};

export default Navbar;
