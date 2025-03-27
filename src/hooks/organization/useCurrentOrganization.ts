
import { useState } from "react";
import { supabase, Organization } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { UseCurrentOrganizationReturn } from "./types";

export function useCurrentOrganization(): UseCurrentOrganizationReturn {
  const { user } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "member" | null>(null);

  async function switchOrganization(organizationId: string) {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();
        
      if (error) throw error;
      
      setCurrentOrganization(data as Organization);
      
      // Get user role in this organization
      const { data: roleData, error: roleError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .single();
        
      if (roleError) throw roleError;
      
      setUserRole(roleData.role as "admin" | "member");
      
      // Update user profile with current organization
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: organizationId })
        .eq("id", user.id);
      
      if (profileError) {
        console.warn("Could not update profile with organization ID:", profileError);
        // Non-blocking error, we'll continue even if this fails
      }
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error switching organization: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  return {
    currentOrganization,
    userRole,
    switchOrganization
  };
}
