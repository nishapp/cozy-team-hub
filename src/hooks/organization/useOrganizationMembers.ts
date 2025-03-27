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
    if (!user || !organizationId) return;
    
    try {
      setLoading(true);
      console.log("Fetching members for organization:", organizationId);
      
      const { data, error } = await supabase
        .from("organization_members")
        .select(`
          id,
          user_id,
          organization_id,
          role,
          created_at,
          profiles:user_id(*)
        `)
        .eq("organization_id", organizationId);
        
      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }
      
      console.log("Fetched members:", data);
      
      const transformedMembers = data.map(item => ({
        ...item,
        profiles: item.profiles
      })) as Member[];
      
      setMembers(transformedMembers);
    } catch (error) {
      console.error("Error in fetchOrganizationMembers:", error);
      if (error instanceof Error) {
        toast.error(`Error fetching members: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred");
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  async function inviteMember(email: string, role: "admin" | "member", organizationId: string) {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();
        
      if (userError && userError.code !== "PGRST116") {
        throw userError;
      }
      
      if (userData) {
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
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
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
      
      console.log("Attempting to remove member:", { memberId, organizationId });
      
      const { data: memberData, error: memberError } = await supabase
        .from("organization_members")
        .select("*")
        .eq("id", memberId)
        .eq("organization_id", organizationId)
        .single();
      
      if (memberError) {
        console.error("Error finding member:", memberError);
        throw new Error(`Member not found: ${memberError.message}`);
      }
      
      console.log("Found member to delete:", memberData);
      
      const { error } = await supabase
        .from("organization_members")
        .delete()
        .eq("id", memberId)
        .eq("organization_id", organizationId);
        
      if (error) {
        console.error("Error during deletion:", error);
        throw error;
      }
      
      console.log("Member deleted successfully");
      toast.success("Member removed successfully");
      
      await fetchOrganizationMembers(organizationId);
    } catch (error) {
      console.error("Remove member error:", error);
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
