
import { useState, useEffect } from "react";
import { supabase, Organization, Member, Profile, isDemoMode } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// Mock data for demo mode
const DEMO_ORGS: Organization[] = [
  {
    id: "demo-org-1",
    name: "Demo Organization",
    created_at: new Date().toISOString()
  },
  {
    id: "demo-org-2",
    name: "Sample Team",
    created_at: new Date().toISOString()
  }
];

const DEMO_MEMBERS: Member[] = [
  {
    id: "demo-member-1",
    user_id: "demo-user-1",
    organization_id: "demo-org-1",
    role: "admin",
    created_at: new Date().toISOString(),
    profiles: {
      id: "demo-user-1",
      email: "demo@example.com",
      full_name: "Demo User",
      avatar_url: null
    }
  }
];

export function useOrganization() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "member" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user || isDemoMode) {
      fetchUserOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setMembers([]);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  async function fetchUserOrganizations() {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use demo data
        setOrganizations(DEMO_ORGS);
        
        // Set the first organization as current if none is selected
        if (!currentOrganization && DEMO_ORGS.length > 0) {
          setCurrentOrganization(DEMO_ORGS[0]);
          setUserRole("admin");
          setMembers(DEMO_MEMBERS);
        }
        setLoading(false);
        return;
      }
      
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
        
        // Set the first organization as current if none is selected
        if (!currentOrganization && orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
          setUserRole(data[0].role as "admin" | "member");
          await fetchOrganizationMembers(orgs[0].id);
        }
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
      
      if (isDemoMode) {
        // Create a demo organization
        const newOrg: Organization = {
          id: `demo-org-${Date.now()}`,
          name,
          created_at: new Date().toISOString()
        };
        
        setOrganizations([...organizations, newOrg]);
        setCurrentOrganization(newOrg);
        setUserRole("admin");
        
        return newOrg;
      }
      
      if (!user) return null;
      
      // Insert organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ name }])
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
      
      // Set as current
      setCurrentOrganization(orgData);
      setUserRole("admin");
      
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

  async function switchOrganization(organizationId: string) {
    if (!user) return;
    
    try {
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error("Organization not found");
      
      setCurrentOrganization(org);
      
      // Get user role in this organization
      const { data, error } = await supabase
        .from("organization_members")
        .select("role")
        .eq("user_id", user.id)
        .eq("organization_id", organizationId)
        .single();
        
      if (error) throw error;
      
      setUserRole(data.role as "admin" | "member");
      
      // Fetch members for this organization
      await fetchOrganizationMembers(organizationId);
      
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error switching organization: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  async function fetchOrganizationMembers(organizationId: string) {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          *,
          profiles:user_id(id, email, full_name, avatar_url)
        `)
        .eq("organization_id", organizationId);
        
      if (error) throw error;
      
      setMembers(data as Member[]);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error fetching members: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  async function inviteMember(email: string, role: "admin" | "member") {
    if (!user || !currentOrganization || userRole !== "admin") return;
    
    try {
      setLoading(true);
      
      // First, check if the user exists by email
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
        
      if (userError && userError.code !== "PGRST116") { // PGRST116 is not found error
        throw userError;
      }
      
      if (userData) {
        // User exists, add them directly to organization
        const { error: memberError } = await supabase
          .from("organization_members")
          .insert([
            {
              user_id: userData.id,
              organization_id: currentOrganization.id,
              role
            }
          ]);
          
        if (memberError) throw memberError;
        
        toast.success(`${email} has been added to the organization!`);
        await fetchOrganizationMembers(currentOrganization.id);
      } else {
        // Generate a random token
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // Set expiration date to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        // Insert invitation
        const { error } = await supabase
          .from("invitations")
          .insert([
            {
              email,
              organization_id: currentOrganization.id,
              role,
              token,
              expires_at: expiresAt.toISOString()
            }
          ]);
          
        if (error) throw error;
        
        toast.success(`Invitation sent to ${email}`);
        
        // For demo purposes, generate a link that would be in the email
        const inviteLink = `${window.location.origin}/accept-invite?token=${token}`;
        console.log("Invitation link:", inviteLink);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error inviting member: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateMemberRole(memberId: string, newRole: "admin" | "member") {
    if (!user || !currentOrganization || userRole !== "admin") return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .eq("organization_id", currentOrganization.id);
        
      if (error) throw error;
      
      toast.success(`Member role updated to ${newRole}`);
      
      // Refresh members
      await fetchOrganizationMembers(currentOrganization.id);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error updating role: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!user || !currentOrganization || userRole !== "admin") return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", currentOrganization.id);
        
      if (error) throw error;
      
      toast.success("Member removed successfully");
      
      // Refresh members
      await fetchOrganizationMembers(currentOrganization.id);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error removing member: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    organizations,
    currentOrganization,
    members,
    userRole,
    loading,
    createOrganization,
    switchOrganization,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchOrganizationMembers
  };
}
