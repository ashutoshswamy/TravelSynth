import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CalendarDays,
  Tag,
  Wallet,
  Info,
  AlertCircle,
  Plane,
  ChevronLeft,
} from "lucide-react"; // Added icons
import { format } from "date-fns";
import Link from "next/link";
import SignOutButton from "@/components/auth/signout-button";
import { Button } from "@/components/ui/button"; // Ensure the correct casing and path
import ItineraryDisplay from "@/components/plan/itinerary-display"; // Adjusted casing to match file system
import type { Tables } from "@/lib/database.types"; // Import Supabase Table type
import { Badge } from "@/components/ui/badge"; // Adjusted path to match file system

// Define the detailed structures matching the expected AI output and ItineraryDisplay component
interface ActivityDetail {
  time: string;
  description: string;
  estimated_cost?: string;
  booking_info?: string;
  alternatives?: string;
}

interface TravelDay {
  day: number;
  title: string;
  activities: ActivityDetail[] | string[]; // Allow both formats
  notes?: string;
}

interface TravelPlanOutput {
  days: TravelDay[];
}

interface PlanPageProps {
  params: { id: string };
}

// Type guard to check if an activity is in the detailed object format
function isActivityDetail(activity: any): activity is ActivityDetail {
  return (
    typeof activity === "object" &&
    activity !== null &&
    "description" in activity &&
    "time" in activity
  );
}

// Type guard to check if an activity is just a string
function isActivityString(activity: any): activity is string {
  return typeof activity === "string";
}

// Validation function for the itinerary data
function isValidItinerary(data: any): data is TravelPlanOutput {
  if (!data || typeof data !== "object" || !Array.isArray(data.days)) {
    console.error(
      "Itinerary validation failed: 'days' array is missing or not an array."
    );
    return false;
  }
  for (const day of data.days) {
    if (
      typeof day !== "object" ||
      day === null ||
      typeof day.day !== "number" ||
      typeof day.title !== "string" ||
      !Array.isArray(day.activities)
    ) {
      console.error("Itinerary validation failed: Invalid day structure.", day);
      return false;
    }
    // Check activities array contents
    for (const activity of day.activities) {
      // Allow empty activity array, but if not empty, validate contents
      if (!isActivityDetail(activity) && !isActivityString(activity)) {
        console.error(
          "Itinerary validation failed: Invalid activity structure.",
          activity
        );
        return false;
      }
    }
  }
  return true;
}

export default async function PlanPage({ params }: PlanPageProps) {
  const cookieStore = cookies();
  const supabase = createClient();

  const {
    data: { session },
  } = await (await supabase).auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the specific travel plan using Tables type
  const { data: plan, error } = await (
    await supabase
  )
    .from("travel_plans")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id) // Ensure user owns the plan
    .single<Tables<"travel_plans">>(); // Use the specific table type

  if (error || !plan) {
    console.error("Error fetching plan or plan not found:", error);
    notFound(); // Render a 404 page if plan doesn't exist or user doesn't own it
  }

  // Validate and parse AI response using the validation function
  let itineraryData: TravelPlanOutput | null = null;
  let itineraryError: string | null = null;

  if (plan.ai_response) {
    if (isValidItinerary(plan.ai_response)) {
      itineraryData = plan.ai_response as TravelPlanOutput;
    } else {
      console.warn(`Invalid itinerary data format for plan ${plan.id}`);
      itineraryError =
        "The AI-generated itinerary data is in an unexpected format and cannot be displayed correctly. The structure might be outdated.";
      // Log the problematic data for debugging
      // console.warn("Raw ai_response:", plan.ai_response);
    }
  } else {
    console.warn(`Missing itinerary data for plan ${plan.id}`);
    itineraryError =
      "The AI-generated itinerary data is missing for this plan.";
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10">
      {/* Updated header classes to match home page style */}
      <header className="w-full px-4 md:px-6 py-6 md:py-8 flex justify-between items-center bg-muted/50">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10 flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary truncate flex items-center gap-1 md:gap-2">
            <Plane className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            <span className="truncate">
              {plan.destination || "Travel Plan"}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-grow container mx-auto py-8 md:py-12">
        <Card className="mb-8 md:mb-10 shadow-lg rounded-lg overflow-hidden">
          <CardHeader className="bg-primary/5 p-4 md:p-6">
            <CardTitle className="text-xl md:text-2xl text-primary flex items-center gap-2 md:gap-3">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-accent shrink-0" />
              {plan.destination}
            </CardTitle>
            <CardDescription className="pt-1 text-xs md:text-sm">
              Trip created on{" "}
              {plan.created_at
                ? format(new Date(plan.created_at), "PPP")
                : "Unknown date"}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 text-sm">
            <div className="flex items-center gap-2 md:gap-3 text-muted-foreground p-3 bg-secondary/50 rounded-md shadow-sm">
              <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              <div>
                <span className="block text-xs font-medium text-primary/80">
                  DURATION
                </span>
                <strong className="text-sm md:text-base text-foreground">
                  {plan.days || "?"} days
                </strong>
              </div>
            </div>
            {plan.interests && plan.interests.length > 0 && (
              <div className="flex items-start gap-2 md:gap-3 text-muted-foreground p-3 bg-secondary/50 rounded-md shadow-sm sm:col-span-2 lg:col-span-1">
                <Tag className="w-4 h-4 md:w-5 md:h-5 text-primary mt-1 shrink-0" />
                <div>
                  <span className="block text-xs font-medium text-primary/80 mb-1">
                    INTERESTS
                  </span>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {plan.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="text-xs"
                      >
                        {interest}
                      </Badge> // Use Badge component
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 md:gap-3 text-muted-foreground p-3 bg-secondary/50 rounded-md shadow-sm">
              <Wallet className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
              <div>
                <span className="block text-xs font-medium text-primary/80">
                  BUDGET
                </span>
                <strong className="text-sm md:text-base text-foreground">
                  {plan.budget || "Not specified"}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separator removed, spacing adjusted */}

        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-6 md:mb-8 text-center">
          Your AI-Generated Itinerary
        </h2>

        {itineraryData ? (
          <ItineraryDisplay itinerary={itineraryData} />
        ) : (
          <Card className="border-dashed border-destructive bg-destructive/10 shadow-md rounded-lg">
            <CardHeader className="flex flex-row items-center gap-2 md:gap-3 p-4">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
              <CardTitle className="text-destructive text-base md:text-lg">
                Itinerary Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-destructive-foreground text-sm md:text-base">
                {itineraryError ||
                  "An unknown error occurred while loading the itinerary."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      {/* Footer is added by layout */}
    </div>
  );
}
