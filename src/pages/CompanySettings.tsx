
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyInfoForm from "@/components/company/CompanyInfoForm";
import { Database } from "@/types/supabase";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

const CompanySettings = () => {
  const { user, loading: authLoading } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{ role?: 'admin' | 'user' } | null>(null);

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
      } catch (error) {
        console.error("Error fetching company info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleCompanyUpdate = (updatedInfo: CompanyInfo) => {
    setCompanyInfo(updatedInfo);
  };

  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
  }
  
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
                <CompanyInfoForm 
                  companyInfo={companyInfo} 
                  onUpdate={handleCompanyUpdate} 
                />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default CompanySettings;
