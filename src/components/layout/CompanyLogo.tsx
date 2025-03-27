
import { Link } from "react-router-dom";
import { getStorageUrl } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

interface CompanyLogoProps {
  companyInfo: CompanyInfo;
}

const CompanyLogo = ({ companyInfo }: CompanyLogoProps) => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      {companyInfo.logo_url ? (
        <div className="h-8 w-auto">
          <img 
            src={getStorageUrl('company_logos', companyInfo.logo_url)} 
            alt={companyInfo.name} 
            className="h-8 w-auto dark:hidden"
          />
          <img 
            src={getStorageUrl('company_logos', companyInfo.logo_url)} 
            alt={companyInfo.name} 
            className="h-8 w-auto hidden dark:block filter invert"
          />
        </div>
      ) : (
        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
          {companyInfo.name.charAt(0)}
        </div>
      )}
      <span className="font-bold inline-block text-lg md:text-xl">
        {companyInfo.name}
      </span>
    </Link>
  );
};

export default CompanyLogo;
