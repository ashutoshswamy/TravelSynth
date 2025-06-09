"use client";

import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function SignOutButton() {
  const { supabase } = useSupabase();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (!supabase) return;
    setIsSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: error.message,
      });
      setIsSigningOut(false);
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push("/"); // Redirect to home page after sign out
      router.refresh(); // Ensure layout and pages reflect signed-out state
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSignOut}
      disabled={isSigningOut}
      aria-label="Sign out"
      className="text-muted-foreground hover:text-destructive"
    >
      {isSigningOut ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : (
        <LogOut className="h-5 w-5" />
      )}
    </Button>
  );
}
