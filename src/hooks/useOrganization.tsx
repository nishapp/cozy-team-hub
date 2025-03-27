
import { useState, useEffect } from "react";
import { supabase, Organization, Member, Profile, isDemoMode } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// Demo data for when running without Supabase credentials
const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: "demo-org-1",
    name: "Demo Company",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-org-2",
    name: "Personal Workspace",
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
];

const DEMO_MEMBERS: Member[] = [
  {
    id: "demo-member-1",
    user_id: "demo-user-id",
    organization_id: "demo-org-1",
    role: "admin",
    created_at: new Date().toISOString(),
    profiles: {
      id: "demo-user-id",
      email: "demo@example.com",
      full_name: "Demo User",
      avatar_url: null,
    },
  },
  {
    id: "demo-member-2",
    user_id: "demo-user-2",
    organization_id: "demo-org-1",
    role: "member",
    created_at: new Date().toISOString(),
    profiles: {
      id: "demo-user-2",
      email: "team.member@example.com",
      full_name: "Team Member",
      avatar_url: null,
    },
  },
];

export function useOrganization() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<"admin" | "member" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
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
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use demo data when in demo mode
        setOrganizations(DEMO_ORGANIZATIONS);
        
        // Set the first organization as current if none is selected
        if (!currentOrganization && DEMO_ORGANIZATIONS.length > 0) {
          setCurrentOrganization(DEMO_ORGANIZATIONS[0]);
          setUserRole("admin");
          await fetchOrganizationMembers(DEMO_ORGANIZATIONS[0].id);
        }
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("members")
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
    if (!user) return null;
    
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Create a demo organization
        const newOrg: Organization = {
          id: `demo-org-${Date.now()}`,
          name,
          created_at: new Date().toISOString(),
        };
        
        // Add the organization to the list
        setOrganizations([...organizations, newOrg]);
        
        // Create a new member entry
        const newMember: Member = {
          id: `demo-member-${Date.now()}`,
          user_id: user.id,
          organization_id: newOrg.id,
          role: "admin",
          created_at: new Date().toISOString(),
          profiles: {
            id: user.id,
            email: user.email || "demo@example.com",
            full_name: "Demo User",
          },
        };
        
        // Set as current
        setCurrentOrganization(newOrg);
        setUserRole("admin");
        setMembers([newMember]);
        
        toast.success(`Organization "${name}" created successfully!`);
        setLoading(false);
        return newOrg;
      }
      
      // Insert organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([{ name }])
        .select()
        .single();

      if (orgError) throw orgError;
      
      // Insert member (creator as admin)
      const { error: memberError } = await supabase
        .from("members")
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
      if (isDemoMode) {
        const org = organizations.find(o => o.id === organizationId);
        if (!org) throw new Error("Organization not found");
        
        setCurrentOrganization(org);
        setUserRole("admin");
        
        // Set demo members for this organization
        const demoOrgMembers = DEMO_MEMBERS.filter(m => m.organization_id === organizationId);
        setMembers(demoOrgMembers.length > 0 ? demoOrgMembers : DEMO_MEMBERS);
        return;
      }
      
      const org = organizations.find(o => o.id === organizationId);
      if (!org) throw new Error("Organization not found");
      
      setCurrentOrganization(org);
      
      // Get user role in this organization
      const { data, error } = await supabase
        .from("members")
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
      if (isDemoMode) {
        // Use demo data for members
        const demoOrgMembers = DEMO_MEMBERS.filter(m => m.organization_id === organizationId);
        setMembers(demoOrgMembers.length > 0 ? demoOrgMembers : DEMO_MEMBERS);
        return;
      }
      
      const { data, error } = await supabase
        .from("members")
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
      
      // In a real app, you would send an email here with the invitation link
      // For now, we'll just show a success message with the token
      
      toast.success(`Invitation sent to ${email}`);
      
      // For demo purposes, generate a link that would be in the email
      const inviteLink = `${window.location.origin}/accept-invite?token=${token}`;
      console.log("Invitation link:", inviteLink);
      
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
        .from("members")
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
        .from("members")
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
