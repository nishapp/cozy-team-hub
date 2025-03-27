
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageTransition from "../components/ui/PageTransition";
import { supabase, getStorageUrl } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Globe } from "lucide-react";
import { Database } from "@/types/supabase";

type CompanyInfo = Database['public']['Tables']['company']['Row'];

const Contact = () => {
  const { user, loading: authLoading } = useAuth();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Redirect unauthenticated users to login
  if (!user && !authLoading) {
    return <Navigate to="/auth" replace />;
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
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          {companyInfo && (
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{companyInfo.name}</h2>
                  </div>
                  
                  {companyInfo.logo_url && (
                    <div className="mb-4">
                      <img 
                        src={getStorageUrl('company_logos', companyInfo.logo_url)} 
                        alt={`${companyInfo.name} logo`}
                        className="max-h-24 object-contain dark:hidden"
                      />
                      <img 
                        src={getStorageUrl('company_logos', companyInfo.logo_url)} 
                        alt={`${companyInfo.name} logo`}
                        className="max-h-24 object-contain hidden dark:block filter invert"
                      />
                    </div>
                  )}
                  
                  {companyInfo.contact && (
                    <div className="flex items-center gap-2">
                      <Phone size={20} className="text-primary" />
                      <span>{companyInfo.contact}</span>
                    </div>
                  )}
                  
                  {companyInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={20} className="text-primary" />
                      <a href={`mailto:${companyInfo.email}`} className="hover:underline">
                        {companyInfo.email}
                      </a>
                    </div>
                  )}
                  
                  {companyInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={20} className="text-primary" />
                      <a href={companyInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {companyInfo.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <input
                          id="name"
                          type="text"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input
                          id="email"
                          type="email"
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                      <input
                        id="subject"
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Subject"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">Message</label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-3 py-2 border rounded-md resize-none"
                        placeholder="Your message"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      Send Message
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
};

export default Contact;
