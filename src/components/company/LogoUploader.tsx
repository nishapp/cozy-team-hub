
import { useState } from "react";
import { Upload } from "lucide-react";
import { getStorageUrl } from "@/lib/supabase";
import { Database } from "@/types/supabase";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

interface LogoUploaderProps {
  companyInfo: CompanyInfo;
  logoPreview: string | null;
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
}

const LogoUploader = ({ 
  companyInfo, 
  logoPreview, 
  setLogoFile, 
  setLogoPreview 
}: LogoUploaderProps) => {
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="logo" className="text-sm font-medium">Company Logo</label>
      <div className="flex items-center gap-4">
        {logoPreview && (
          <div className="h-16 w-16 relative">
            <img 
              src={logoPreview} 
              alt="Company logo preview" 
              className="h-full w-full object-contain dark:hidden"
            />
            <img 
              src={logoPreview} 
              alt="Company logo preview" 
              className="h-full w-full object-contain hidden dark:block filter invert"
            />
          </div>
        )}
        <div className="flex-1">
          <label 
            htmlFor="logo-upload" 
            className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted"
          >
            <Upload size={16} />
            <span>Upload Logo</span>
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The logo will automatically be inverted in dark mode
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
