
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
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
import { toast } from "sonner";

// Form validation schema
const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

const AuthForm = () => {
  const { signIn, signUp, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthFormValues) => {
    const { email, password } = values;
    
    try {
      if (authMode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Reset form after successful signup
        form.reset();
        // Switch to sign in
        setAuthMode("signin");
        toast.success("Account created successfully! Check your email for verification.");
      }
    } catch (error) {
      // Error handled in Auth context
      console.error(error);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
    form.reset();
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-sm border">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {authMode === "signin" ? "Sign in to your account" : "Create a new account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {authMode === "signin"
            ? "Enter your credentials to sign in"
            : "Fill out the form to create your account"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...field} 
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
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
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {authMode === "signin" ? "Signing in..." : "Signing up..."}
              </span>
            ) : (
              <>{authMode === "signin" ? "Sign in" : "Sign up"}</>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button 
          variant="link" 
          className="text-sm font-medium" 
          onClick={toggleAuthMode}
          disabled={loading}
        >
          {authMode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
};

export default AuthForm;
