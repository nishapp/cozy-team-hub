
import { Member } from "../../lib/supabase";
import { useOrganization } from "../../hooks/useOrganization";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, UserCheck, UserMinus, UserX } from "lucide-react";

interface TeamListProps {
  members: Member[];
}

const TeamList = ({ members }: TeamListProps) => {
  const { userRole, updateMemberRole, removeMember } = useOrganization();
  const isAdmin = userRole === "admin";

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleRoleChange = (memberId: string, newRole: "admin" | "member") => {
    if (confirm(`Are you sure you want to change this member's role to ${newRole}?`)) {
      updateMemberRole(memberId, newRole);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member from the organization?")) {
      removeMember(memberId);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar>
                  {member.profiles?.avatar_url ? (
                    <AvatarImage src={member.profiles.avatar_url} alt={member.profiles.full_name || "Team member"} />
                  ) : (
                    <AvatarFallback>{getInitials(member.profiles?.full_name)}</AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{member.profiles?.full_name || "Unnamed User"}</span>
              </TableCell>
              <TableCell>{member.profiles?.email}</TableCell>
              <TableCell>
                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                  {member.role === "admin" ? "Admin" : "Member"}
                </Badge>
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role !== "admin" && (
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member.id, "admin")}
                          className="cursor-pointer"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {member.role !== "member" && (
                        <DropdownMenuItem 
                          onClick={() => handleRoleChange(member.id, "member")}
                          className="cursor-pointer"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Make Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="cursor-pointer text-red-600"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TeamList;
