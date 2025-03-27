
import { useState, useEffect } from "react";
import { supabase, Organization, isDemoMode } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { UseOrganizationsReturn } from "./types";

export function useOrganizations(): UseOrganizationsReturn {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrganizations();
    } else {
      setOrganizations([]);
      setLoading(false);
    }
  }, [user]);

  async function fetchUserOrganizations() {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          organization_id,
          role,
          organizations:organization_id(*)
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const orgs = data.map((item) => item.organizations as Organization);
        setOrganizations(orgs);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error fetching organizations: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(name: string) {
    try {
      setLoading(true);
      
      if (!user) return null;
      
      // Insert organization with created_by field
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ 
          name,
          created_by: user.id  // Track the creator of the organization
        }])
        .select()
        .single();

      if (orgError) throw orgError;
      
      // Insert member (creator as admin)
      const { error: memberError } = await supabase
        .from("organization_members")
        .insert([
          {
            user_id: user.id,
            organization_id: orgData.id,
            role: "admin"
          }
        ]);

      if (memberError) throw memberError;
      
      toast.success(`Organization "${name}" created successfully!`);
      
      // Refresh organizations
      await fetchUserOrganizations();
      
      return orgData;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error creating organization: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }

  return {
    organizations,
    loading,
    createOrganization,
    fetchUserOrganizations
  };
}
