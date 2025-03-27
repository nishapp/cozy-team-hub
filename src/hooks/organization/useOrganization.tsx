
import { useState, useEffect } from "react";
import { Organization, Member } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useOrganizations } from "./useOrganizations";
import { useCurrentOrganization } from "./useCurrentOrganization";
import { useOrganizationMembers } from "./useOrganizationMembers";
import { UseOrganizationReturn } from "./types";

// This combines the three hooks into a single hook that maintains
// the same API as the original useOrganization hook
export function useOrganization(): UseOrganizationReturn {
  const { user } = useAuth();
  const organizationsHook = useOrganizations();
  const currentOrgHook = useCurrentOrganization();
  const membersHook = useOrganizationMembers();
  const [loading, setLoading] = useState(true);
  
  // Set up the initial organization when organizations load
  useEffect(() => {
    const setupInitialOrganization = async () => {
      if (organizationsHook.organizations.length > 0 && !currentOrgHook.currentOrganization) {
        await currentOrgHook.switchOrganization(organizationsHook.organizations[0].id);
      }
    };
    
    if (!loading && organizationsHook.organizations.length > 0) {
      setupInitialOrganization();
    }
  }, [organizationsHook.organizations, currentOrgHook.currentOrganization, loading]);
  
  // Update members when current organization changes
  useEffect(() => {
    if (currentOrgHook.currentOrganization) {
      membersHook.fetchOrganizationMembers(currentOrgHook.currentOrganization.id);
    }
  }, [currentOrgHook.currentOrganization]);
  
  // Set loading state based on other loading states
  useEffect(() => {
    setLoading(organizationsHook.loading);
  }, [organizationsHook.loading]);
  
  // Enhanced switch organization function to update members as well
  const switchOrganization = async (organizationId: string) => {
    await currentOrgHook.switchOrganization(organizationId);
    if (organizationId) {
      await membersHook.fetchOrganizationMembers(organizationId);
    }
  };
  
  // Enhanced create organization function to set it as the current org
  const createOrganization = async (name: string) => {
    const org = await organizationsHook.createOrganization(name);
    if (org) {
      await switchOrganization(org.id);
    }
    return org;
  };

  // Wrapper functions that handle the current organization ID
  const inviteMember = (email: string, role: "admin" | "member") => {
    if (!currentOrgHook.currentOrganization) return Promise.resolve();
    return membersHook.inviteMember(email, role, currentOrgHook.currentOrganization.id);
  };

  const updateMemberRole = (memberId: string, role: "admin" | "member") => {
    if (!currentOrgHook.currentOrganization) return Promise.resolve();
    return membersHook.updateMemberRole(memberId, role, currentOrgHook.currentOrganization.id);
  };

  const removeMember = (memberId: string) => {
    if (!currentOrgHook.currentOrganization) return Promise.resolve();
    return membersHook.removeMember(memberId, currentOrgHook.currentOrganization.id);
  };
  
  return {
    // From useOrganizations
    organizations: organizationsHook.organizations,
    fetchUserOrganizations: organizationsHook.fetchUserOrganizations,
    
    // From useCurrentOrganization
    currentOrganization: currentOrgHook.currentOrganization,
    userRole: currentOrgHook.userRole,
    
    // From useOrganizationMembers
    members: membersHook.members,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchOrganizationMembers: membersHook.fetchOrganizationMembers,
    
    // Enhanced functions
    switchOrganization,
    createOrganization,
    
    // Common
    loading
  };
}

// Make sure the default export is properly defined
export default useOrganization;
