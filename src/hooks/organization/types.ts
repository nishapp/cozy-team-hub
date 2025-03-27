
import { Organization, Member, Profile } from "../../lib/supabase";

// Types for organization-related hooks
export interface UseOrganizationsReturn {
  organizations: Organization[];
  loading: boolean;
  createOrganization: (name: string) => Promise<Organization | null>;
  fetchUserOrganizations: () => Promise<void>;
}

export interface UseCurrentOrganizationReturn {
  currentOrganization: Organization | null;
  userRole: "admin" | "member" | null;
  switchOrganization: (organizationId: string) => Promise<void>;
}

export interface UseOrganizationMembersReturn {
  members: Member[];
  loading: boolean;
  inviteMember: (email: string, role: "admin" | "member", organizationId: string) => Promise<void>;
  updateMemberRole: (memberId: string, newRole: "admin" | "member", organizationId: string) => Promise<void>;
  removeMember: (memberId: string, organizationId: string) => Promise<void>;
  fetchOrganizationMembers: (organizationId: string) => Promise<void>;
}

// Combined return type that matches the original hook
export interface UseOrganizationReturn {
  organizations: Organization[];
  currentOrganization: Organization | null;
  userRole: "admin" | "member" | null;
  members: Member[];
  loading: boolean;
  createOrganization: (name: string) => Promise<Organization | null>;
  switchOrganization: (organizationId: string) => Promise<void>;
  inviteMember: (email: string, role: "admin" | "member") => Promise<void>;
  updateMemberRole: (memberId: string, newRole: "admin" | "member") => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  fetchUserOrganizations: () => Promise<void>;
  fetchOrganizationMembers: (organizationId: string) => Promise<void>;
}
