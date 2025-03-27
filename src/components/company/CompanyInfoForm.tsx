import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase, getStorageUrl } from "@/lib/supabase";
import LogoUploader from "./LogoUploader";
import { Database } from "@/types/supabase";
import { Input } from "@/components/ui/input";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

interface CompanyInfoFormProps {
  companyInfo: CompanyInfo;
  onUpdate: (updatedInfo: CompanyInfo) => void;
}

const CompanyInfoForm = ({ companyInfo, onUpdate }: CompanyInfoFormProps) => {
  const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    companyInfo.logo_url ? 
    getStorageUrl('company_logos', companyInfo.logo_url) : 
    null
  );
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    setSaving(true);
    
    try {
      let logoUrl = formData.logo_url;
      
      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('company_logos')
          .upload(fileName, logoFile);
          
        if (uploadError) throw uploadError;
        
        logoUrl = fileName;
      }
      
      const updatedInfo = {
        ...formData,
        logo_url: logoUrl,
      };
      
      const { error: updateError } = await supabase
        .from('company')
        .update({
          name: updatedInfo.name,
          logo_url: updatedInfo.logo_url,
          contact: updatedInfo.contact,
          email: updatedInfo.email,
          website: updatedInfo.website,
        })
        .eq('id', updatedInfo.id);
        
      if (updateError) throw updateError;
      
      onUpdate(updatedInfo);
      
      toast({
        title: "Success",
        description: "Company information updated successfully",
      });
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({
        title: "Error",
        description: "Failed to update company information",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Company Name</label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name || ''}
          onChange={handleInputChange}
          className="w-full"
          required
        />
      </div>
      
      <LogoUploader
        companyInfo={formData}
        logoPreview={logoPreview}
        setLogoFile={setLogoFile}
        setLogoPreview={setLogoPreview}
      />
      
      <div className="space-y-2">
        <label htmlFor="contact" className="text-sm font-medium">Contact Number</label>
        <Input
          id="contact"
          name="contact"
          type="text"
          value={formData.contact || ''}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium">Website</label>
        <Input
          id="website"
          name="website"
          type="url"
          value={formData.website || ''}
          onChange={handleInputChange}
          className="w-full"
          placeholder="https://example.com"
        />
      </div>
      
      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};

export default CompanyInfoForm;
