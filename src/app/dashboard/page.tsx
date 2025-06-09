import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  MapPin,
  CalendarDays,
  Tag,
  Wallet,
  LogOut,
  Plus,
  Plane,
  AlertCircle,
  DraftingCompass,
} from "lucide-react"; // Added icons
import SignOutButton from "@/components/auth/signout-button";
import type { Tables } from "@/lib/database.types";
import { Badge } from "@/components/ui/badge";
import DeletePlanButton from "@/components/dashboard/delete-plan-button"; // Import the delete button component

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { data: travelPlans, error } = await supabase
    .from("travel_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // Move error handling and return inside the function
  if (error) {
    console.error("Error fetching travel plans:", error);
    // Consider rendering an error message instead of potentially crashing
    // or returning null/empty content depending on desired behavior.
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10">
      {/* Updated header classes to match home page style */}
      <header className="w-full px-4 md:px-6 py-6 md:py-8 flex justify-between items-center bg-muted/50">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl md:text-2xl font-bold text-primary"
        >
          <Plane className="w-5 h-5 md:w-6 md:h-6" />
          <span>TravelSynth</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 md:py-12 px-4 md:px-6">
        {" "}
        {/* Added padding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Your Travel Plans
            </h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              View and manage your generated itineraries.
            </p>
          </div>
          <Link href="/generate">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Create New Plan
            </Button>
          </Link>
        </div>
        {error && (
          <Card className="mb-6 md:mb-8 border-destructive bg-destructive/10 shadow-md p-4 md:p-6">
            <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
              <CardTitle className="text-destructive text-base md:text-lg">
                Error Loading Plans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm">
                There was an issue fetching your saved travel plans. Please try
                refreshing the page.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-2">
                {error.message}
              </p>
            </CardContent>
          </Card>
        )}
        {travelPlans && travelPlans.length > 0 ? (
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {travelPlans.map((plan) => (
              <Card
                key={plan.id}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card rounded-lg overflow-hidden"
              >
                <CardHeader className="bg-primary/5 p-4">
                  <CardTitle className="text-lg md:text-xl text-primary flex items-center gap-2">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                    <span className="truncate">
                      {plan.destination || "Unnamed Plan"}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs pt-1">
                    Created{" "}
                    {plan.created_at
                      ? format(new Date(plan.created_at), "PPP")
                      : "Unknown date"}
                  </CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="flex-grow p-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <span>{plan.days || "?"} days</span>
                  </div>
                  {plan.interests && plan.interests.length > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Tag className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        {plan.interests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="text-xs"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      Budget:{" "}
                      <span className="font-medium">
                        {plan.budget || "Not specified"}
                      </span>
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-3 bg-secondary/30 grid grid-cols-2 gap-2">
                  {" "}
                  {/* Updated footer padding and layout */}
                  <Link href={`/plan/${plan.id}`} className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    >
                      View Details
                    </Button>
                  </Link>
                  {/* Add the Delete Button */}
                  <DeletePlanButton planId={plan.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          !error && (
            <Card className="text-center py-12 md:py-16 px-4 md:px-6 border-2 border-dashed border-border rounded-lg bg-background shadow-sm">
              <DraftingCompass className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                No Travel Plans Yet
              </h3>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Ready to explore? Let's create your first AI-powered itinerary!
              </p>
              <Link href="/generate" className="inline-block">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" /> Plan Your First Trip
                </Button>
              </Link>
            </Card>
          )
        )}
      </main>
      {/* Footer is added by layout */}
    </div>
  );
}
