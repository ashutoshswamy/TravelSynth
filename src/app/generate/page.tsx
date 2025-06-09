import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GeneratePlanForm from "@/components/generate/generate-plan-form";
import SignOutButton from "@/components/auth/signout-button";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Updated import path
import { ChevronLeft, Plane } from "lucide-react"; // Import icons

export default async function GeneratePage() {
  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { session },
  } = await (await supabase).auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10">
      {/* Updated header classes to match home page style */}
      <header className="w-full px-4 md:px-6 py-6 md:py-8 flex justify-between items-center bg-muted/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary"
        >
          <Plane className="w-5 h-5 md:w-6 md:h-6" />
          <span>TravelSynth</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 md:py-12 flex items-center justify-center">
        <div className="w-full max-w-lg md:max-w-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3 text-center">
            Create Your Dream Itinerary
          </h2>
          <p className="text-muted-foreground text-center mb-8 md:mb-10 max-w-lg mx-auto text-sm md:text-base">
            Fill in the details below and let our AI craft a personalized travel
            plan, just for you. Specify your destination, trip length,
            interests, and budget.
          </p>
          <GeneratePlanForm userId={session.user.id} />
        </div>
      </main>
      {/* Footer is added by layout */}
    </div>
  );
}
