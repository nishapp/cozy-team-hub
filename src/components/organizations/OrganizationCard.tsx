
import { Organization } from "../../lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganization } from "../../hooks/useOrganization";
import { useNavigate } from "react-router-dom";

interface OrganizationCardProps {
  organization: Organization;
  isActive?: boolean;
}

const OrganizationCard = ({ organization, isActive = false }: OrganizationCardProps) => {
  const { switchOrganization } = useOrganization();
  const navigate = useNavigate();
  
  const handleSelect = () => {
    switchOrganization(organization.id);
    navigate("/dashboard");
  };
  
  // Format the creation date
  const formattedDate = new Date(organization.created_at).toLocaleDateString();
  
  return (
    <Card className={`overflow-hidden transform transition-all duration-200 ${isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{organization.name}</CardTitle>
        <CardDescription>Created on {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-24 flex items-center justify-center bg-muted/50 rounded-md">
          <p className="text-2xl font-bold text-muted-foreground">{organization.name[0]}</p>
        </div>
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Button variant="outline" className="w-full" disabled>
            Current Organization
          </Button>
        ) : (
          <Button variant="default" className="w-full" onClick={handleSelect}>
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default OrganizationCard;
