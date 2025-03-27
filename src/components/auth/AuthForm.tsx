
import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { Button } from "@/components/ui/button";

const AuthForm = () => {
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
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

      {authMode === "signin" ? (
        <SignInForm onSuccess={() => {}} />
      ) : (
        <SignUpForm onSuccess={() => setAuthMode("signin")} />
      )}

      <div className="text-center">
        <Button 
          variant="link" 
          className="text-sm font-medium" 
          onClick={toggleAuthMode}
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
