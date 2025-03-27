
import { Link } from "react-router-dom";
import { Mail, Shield, Building2 } from "lucide-react";

interface MainNavigationProps {
  isAdmin: boolean;
}

const MainNavigation = ({ isAdmin }: MainNavigationProps) => {
  return (
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
  );
};

export default MainNavigation;
