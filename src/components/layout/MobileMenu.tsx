
import { Link } from "react-router-dom";
import { Shield, Building2 } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  isAdmin: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, isAdmin, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden border-t">
      <div className="container py-4 space-y-4">
        <Link to="/dashboard" className="block py-2 text-sm font-medium" onClick={onClose}>
          Dashboard
        </Link>
        <Link to="/contact" className="block py-2 text-sm font-medium" onClick={onClose}>
          Contact
        </Link>
        {isAdmin && (
          <>
            <Link to="/admin" className="block py-2 text-sm font-medium flex items-center gap-1" onClick={onClose}>
              <Shield size={16} />
              Admin Dashboard
            </Link>
            <Link to="/company-settings" className="block py-2 text-sm font-medium flex items-center gap-1" onClick={onClose}>
              <Building2 size={16} />
              Company Settings
            </Link>
          </>
        )}
        <Link to="/settings" className="block py-2 text-sm font-medium" onClick={onClose}>
          Settings
        </Link>
      </div>
    </div>
  );
};

export default MobileMenu;
