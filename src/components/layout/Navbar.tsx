
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import MainNavigation from "./MainNavigation";
import UserDropdown from "./UserDropdown";
import MobileMenu from "./MobileMenu";
import CompanyLogo from "./CompanyLogo";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<{
    full_name?: string;
    avatar_url?: string;
    role?: 'admin' | 'user';
  } | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    id: "",
    name: "WDYLT",
    logo_url: "",
    contact: "",
    email: "",
    website: "",
    created_at: "",
    updated_at: ""
  });

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data, error } = await supabase
        .from("company")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching company info:", error);
        return;
      }

      if (data) {
        setCompanyInfo(data as CompanyInfo);
      }
    };

    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, role')
          .eq('id', user.id)
          .single();
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
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <CompanyLogo companyInfo={companyInfo} />
          <MainNavigation isAdmin={isAdmin} />
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <ThemeToggle />
            <UserDropdown 
              user={user} 
              profileData={profileData} 
              signOut={signOut} 
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </nav>
        </div>
      </div>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        isAdmin={isAdmin} 
        onClose={toggleMobileMenu} 
      />
    </header>
  );
};

export default Navbar;
