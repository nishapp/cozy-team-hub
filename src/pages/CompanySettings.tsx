
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase, getStorageUrl } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";
import { Database } from "@/types/supabase";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

const CompanySettings = () => {
  const { user, loading: authLoading } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<{ role?: 'admin' | 'user' } | null>(null);

  // Fetch profile data to check if user is admin
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
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

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { data, error } = await supabase
          .from("company")
          .select("*")
          .single();

        if (error) throw error;
        setCompanyInfo(data);
        
        if (data.logo_url) {
          setLogoPreview(getStorageUrl('company_logos', data.logo_url));
        }
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo) return;
    
    setSaving(true);
    
    try {
      // Upload logo if a new one was selected
      let logoUrl = companyInfo.logo_url;
      
      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('company_logos')
          .upload(fileName, logoFile);
          
        if (uploadError) throw uploadError;
        
        logoUrl = fileName;
      }
      
      // Update company information
      const { error: updateError } = await supabase
        .from('company')
        .update({
          name: companyInfo.name,
          logo_url: logoUrl,
          contact: companyInfo.contact,
          email: companyInfo.email,
          website: companyInfo.website,
        })
        .eq('id', companyInfo.id);
        
      if (updateError) throw updateError;
      
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

  // Redirect unauthenticated users to login
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
  // Redirect non-admin users to dashboard
  if (profileData && profileData.role !== 'admin' && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 container py-8">
          <h1 className="text-3xl font-bold mb-8">Company Settings</h1>
          
          {companyInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Company Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={companyInfo.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="logo" className="text-sm font-medium">Company Logo</label>
                    <div className="flex items-center gap-4">
                      {logoPreview && (
                        <div className="h-16 w-16 relative">
                          <img 
                            src={logoPreview} 
                            alt="Company logo preview" 
                            className="h-full w-full object-contain"
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
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="contact" className="text-sm font-medium">Contact Number</label>
                    <input
                      id="contact"
                      name="contact"
                      type="text"
                      value={companyInfo.contact || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={companyInfo.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={companyInfo.website || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default CompanySettings;
