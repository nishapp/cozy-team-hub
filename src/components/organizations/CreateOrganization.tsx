
import { useState } from "react";
import { useOrganization } from "../../hooks/useOrganization";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Form validation schema
const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

const CreateOrganization = () => {
  const { createOrganization, loading } = useOrganization();
  const navigate = useNavigate();
  
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: OrganizationFormValues) => {
    const { name } = values;
    
    try {
      const org = await createOrganization(name);
      if (org) {
        navigate("/dashboard");
        toast.success(`Organization "${name}" created successfully!`);
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create your organization</h1>
        <p className="text-sm text-muted-foreground">
          Set up your organization to collaborate with your team
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Acme Corporation" 
                      {...field} 
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>
        </Form>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Your organization will be where you and your team collaborate
      </div>
    </div>
  );
};

export default CreateOrganization;
