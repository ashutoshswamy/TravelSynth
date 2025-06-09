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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Mail,
  Lock,
  UserPlus,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"; // Import icons

// Check if Supabase environment variables are set client-side
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const areSupabaseCredsMissing =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === "YOUR_SUPABASE_URL" ||
  supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY";

export default function SignUpPage() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showEnvVarWarning, setShowEnvVarWarning] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility

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

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || showEnvVarWarning || isSubmitting) return; // Prevent submission

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    // Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect after email confirmation
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined, // Conditional redirect URL
      },
    });

    setIsSubmitting(false); // Set submitting to false after the call completes

    if (error) {
      // Check if the error indicates the user already exists
      // Supabase might return a specific error code or message for this.
      // Common indicators include status 409 or messages like "User already registered"
      // Adjust the condition based on the actual error Supabase returns.
      // Example check (might need refinement based on Supabase error details):
      if (
        error.message.includes("User already registered") ||
        error.status === 409 ||
        error.message.toLowerCase().includes("already exists")
      ) {
        const specificError =
          "An account with this email already exists. Please sign in instead.";
        setAuthError(specificError);
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: specificError,
        });
      } else {
        // Handle other sign-up errors
        setAuthError(error.message);
        toast({
          variant: "destructive",
          title: "Sign Up Failed",
          description: error.message,
        });
      }
    } else if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      // This condition might indicate an existing user who hasn't confirmed their email yet.
      // Supabase might resend the confirmation email in this case.
      const existingUnconfirmedError =
        "This email is already registered but not confirmed. Please check your email for the confirmation link, or try signing in.";
      setAuthError(existingUnconfirmedError);
      toast({
        variant: "destructive", // Or maybe 'default' or 'warning' depending on desired UX
        title: "Sign Up Pending Confirmation",
        description: existingUnconfirmedError,
        duration: 8000,
      });
    } else if (data.user) {
      // New user successfully signed up, confirmation email sent.
      toast({
        title: "Sign Up Successful!",
        description: "Please check your email inbox to confirm your account.",
        duration: 8000, // Longer duration
      });
      // Redirect to a confirmation pending page or login after a delay
      setTimeout(() => {
        // Redirecting to login with a message encourages them to check email
        router.push(
          "/auth/login?message=Check your email for confirmation link"
        );
      }, 2000);
    } else {
      // Handle unexpected cases where there's no error but also no user data
      const unexpectedError =
        "An unexpected issue occurred during sign up. Please try again.";
      setAuthError(unexpectedError);
      toast({
        variant: "destructive",
        title: "Sign Up Error",
        description: unexpectedError,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 py-8 md:py-12">
      {" "}
      {/* Removed padding */}
      <Card className="w-full max-w-sm md:max-w-md shadow-xl rounded-lg overflow-hidden">
        {" "}
        {/* Responsive max-width */}
        <CardHeader className="text-center bg-accent/5 p-4 md:p-6">
          {" "}
          {/* Responsive padding */}
          <CardTitle className="text-xl md:text-2xl font-bold text-primary flex items-center justify-center gap-2">
            {" "}
            {/* Responsive text size */}
            <UserPlus className="w-5 h-5 md:w-6 md:h-6" />{" "}
            {/* Adjusted icon size */}
            Create Your Account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm">
            Join TravelSynth to start planning your trips with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
          {" "}
          {/* Responsive padding and spacing */}
          {showEnvVarWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" /> {/* Icon */}
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
              <AlertTitle>Sign Up Error</AlertTitle>
              <AlertDescription className="text-xs md:text-sm">
                {authError}
              </AlertDescription>{" "}
              {/* Responsive text size */}
            </Alert>
          )}
          <form onSubmit={handleSignUp} className="space-y-4">
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
                  className="pl-10 pr-4 text-sm md:text-base" // Add padding for icon, ensure right padding isn't needed here
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
                  placeholder="•••••••• (min. 6 characters)"
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
            <div className="space-y-1 md:space-y-2">
              {" "}
              {/* Responsive spacing */}
              <Label
                htmlFor="confirm-password"
                className="text-muted-foreground"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />{" "}
                {/* Icon */}
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"} // Toggle type
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isSubmitting || showEnvVarWarning}
                  className="pl-10 pr-10 text-sm md:text-base" // Add padding for icons
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-full w-full" />
                  ) : (
                    <Eye className="h-full w-full" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting || showEnvVarWarning}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {/* Loader icon */}
                  Creating Account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="mt-4 md:mt-6 text-center text-xs md:text-sm text-muted-foreground">
            {" "}
            {/* Adjusted margin and text size */}
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:text-primary/80 underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
