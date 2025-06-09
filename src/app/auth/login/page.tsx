"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"; // Import icons

// Check if Supabase environment variables are set client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const areSupabaseCredsMissing =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "YOUR_SUPABASE_URL" ||
  supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEnvVarWarning, setShowEnvVarWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Use useEffect to check environment variables only on the client-side after mount
  useEffect(() => {
    if (areSupabaseCredsMissing) {
      setShowEnvVarWarning(true);
      console.error(
        "Supabase URL or Anon Key is missing or incorrect. Check your .env file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly."
      );
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description:
          "Supabase credentials missing or incorrect. Please check console/server logs.",
        duration: 10000, // Show longer
      });
    }
  }, [toast]); // Add toast to dependency array

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || showEnvVarWarning || isSubmitting) return; // Prevent submission if creds missing or already submitting

    setIsSubmitting(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
      });
      setIsSubmitting(false);
    } else {
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      // Delay redirect slightly to allow toast to be seen
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh(); // Ensure server components re-render
      }, 500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8 md:py-12">
      {" "}
      {/* Removed padding */}
      <Card className="w-full max-w-sm md:max-w-md shadow-xl rounded-lg overflow-hidden">
        {" "}
        {/* Responsive max-width */}
        <CardHeader className="text-center bg-primary/5 p-4 md:p-6">
          {" "}
          {/* Responsive padding */}
          <CardTitle className="text-xl md:text-2xl font-bold text-primary">
            Welcome Back
          </CardTitle>{" "}
          {/* Responsive text size */}
          <CardDescription className="text-muted-foreground text-sm">
            Sign in to access your TravelSynth plans
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {" "}
          {/* Responsive padding and spacing */}
          {showEnvVarWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" /> {/* Use AlertTriangle */}
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription className="text-xs md:text-sm">
                {" "}
                {/* Responsive text size */}
                Supabase environment variables (URL/Anon Key) seem to be missing
                or incorrect. The application might not work correctly. Please
                check the setup.
              </AlertDescription>
            </Alert>
          )}
          {authError && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription className="text-xs md:text-sm">
                {authError}
              </AlertDescription>{" "}
              {/* Responsive text size */}
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 md:space-y-2">
              {" "}
              {/* Responsive spacing */}
              <Label htmlFor="email" className="text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{" "}
                {/* Icon */}
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting || showEnvVarWarning}
                  className="pl-10 pr-4 text-sm md:text-base" // Add left padding for icon, ensure right padding isn't needed here
                />
              </div>
            </div>
            <div className="space-y-1 md:space-y-2">
              {" "}
              {/* Responsive spacing */}
              <Label htmlFor="password" className="text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{" "}
                {/* Icon */}
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"} // Toggle type
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isSubmitting || showEnvVarWarning}
                  className="pl-10 pr-10 text-sm md:text-base" // Add padding for icons
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-full w-full" />
                  ) : (
                    <Eye className="h-full w-full" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isSubmitting || showEnvVarWarning}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {/* Loader icon */}
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
            {" "}
            {/* Adjusted margin and text size */}
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:text-primary/80 underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
