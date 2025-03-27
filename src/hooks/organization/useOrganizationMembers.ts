
import { useState } from "react";
import { supabase, Member } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { UseOrganizationMembersReturn } from "./types";

export function useOrganizationMembers(): UseOrganizationMembersReturn {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchOrganizationMembers(organizationId: string) {
    if (!user) return;
    
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function inviteMember(email: string, role: "admin" | "member", organizationId: string) {
    if (!user) return;
    
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
              organization_id: organizationId,
              role
            }
          ]);
          
        if (memberError) throw memberError;
        
        toast.success(`${email} has been added to the organization!`);
        await fetchOrganizationMembers(organizationId);
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
              organization_id: organizationId,
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

  async function updateMemberRole(memberId: string, newRole: "admin" | "member", organizationId: string) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("organization_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .eq("organization_id", organizationId);
        
      if (error) throw error;
      
      toast.success(`Member role updated to ${newRole}`);
      
      // Refresh members
      await fetchOrganizationMembers(organizationId);
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

  async function removeMember(memberId: string, organizationId: string) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", organizationId);
        
      if (error) throw error;
      
      toast.success("Member removed successfully");
      
      // Refresh members
      await fetchOrganizationMembers(organizationId);
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
    members,
    loading,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchOrganizationMembers
  };
}
