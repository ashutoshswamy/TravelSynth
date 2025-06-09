"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Utensils,
  Bed,
  Landmark,
  Mountain,
  Route,
  Info,
  CheckCircle,
  Clock,
  DollarSign,
  BookOpen,
  Shuffle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define the detailed structures inline or import from a shared types file
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
  activities: ActivityDetail[] | string[]; // Allow for old string format for backward compatibility
  notes?: string;
}

interface TravelPlanOutput {
  days: TravelDay[];
}

interface ItineraryDisplayProps {
  itinerary: TravelPlanOutput;
}

// Helper function to get an icon based on activity keywords
const getActivityIcon = (activity: string): React.ReactNode => {
  const lowerActivity = activity.toLowerCase();
  if (
    lowerActivity.includes("eat") ||
    lowerActivity.includes("dinner") ||
    lowerActivity.includes("lunch") ||
    lowerActivity.includes("breakfast") ||
    lowerActivity.includes("food") ||
    lowerActivity.includes("restaurant") ||
    lowerActivity.includes("cafe")
  ) {
    return (
      <Utensils className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
    ); // Responsive icon size
  }
  if (
    lowerActivity.includes("check-in") ||
    lowerActivity.includes("hotel") ||
    lowerActivity.includes("accommodation") ||
    lowerActivity.includes("stay") ||
    lowerActivity.includes("sleep")
  ) {
    return (
      <Bed className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
    ); // Responsive icon size
  }
  if (
    lowerActivity.includes("museum") ||
    lowerActivity.includes("landmark") ||
    lowerActivity.includes("site") ||
    lowerActivity.includes("monument") ||
    lowerActivity.includes("tour") ||
    lowerActivity.includes("explore") ||
    lowerActivity.includes("old town") ||
    lowerActivity.includes("historic") ||
    lowerActivity.includes("visit")
  ) {
    return (
      <Landmark className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
    ); // Responsive icon size
  }
  if (
    lowerActivity.includes("hike") ||
    lowerActivity.includes("nature") ||
    lowerActivity.includes("park") ||
    lowerActivity.includes("mountain") ||
    lowerActivity.includes("outdoor") ||
    lowerActivity.includes("walk")
  ) {
    return (
      <Mountain className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
    ); // Responsive icon size
  }
  if (
    lowerActivity.includes("travel") ||
    lowerActivity.includes("drive") ||
    lowerActivity.includes("flight") ||
    lowerActivity.includes("train") ||
    lowerActivity.includes("transfer") ||
    lowerActivity.includes("arrive") ||
    lowerActivity.includes("depart")
  ) {
    return (
      <Route className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
    ); // Responsive icon size
  }
  // Default icon
  return (
    <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent mr-2 shrink-0" />
  ); // Responsive icon size
};

export default function ItineraryDisplay({ itinerary }: ItineraryDisplayProps) {
  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <Card className="border-dashed border-accent bg-accent/10 p-4 md:p-6">
        {" "}
        {/* Added padding */}
        <CardHeader className="p-0 mb-2">
          {" "}
          {/* Adjusted padding */}
          <CardTitle className="text-accent flex items-center gap-2 text-base md:text-lg">
            <Info className="w-4 h-4 md:w-5 md:h-5" /> Itinerary Empty
          </CardTitle>{" "}
          {/* Responsive text and icon size */}
        </CardHeader>
        <CardContent className="p-0">
          {" "}
          {/* Adjusted padding */}
          <p className="text-muted-foreground text-sm md:text-base">
            No daily activities were found in the generated plan.
          </p>{" "}
          {/* Responsive text size */}
        </CardContent>
      </Card>
    );
  }

  // Determine default open item (e.g., the first day)
  const defaultOpenValue = itinerary.days[0]
    ? `day-${itinerary.days[0].day}`
    : undefined;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpenValue}
      className="w-full space-y-3 md:space-y-4"
    >
      {" "}
      {/* Responsive spacing */}
      {itinerary.days.map((dayData) => (
        <AccordionItem
          key={`day-${dayData.day}`}
          value={`day-${dayData.day}`}
          className="border bg-card rounded-lg shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 md:px-6 md:py-4 hover:bg-secondary/50 transition-colors [&[data-state=open]]:bg-secondary/50 text-left">
            {" "}
            {/* Responsive padding */}
            <div className="flex items-center gap-2 md:gap-3">
              {" "}
              {/* Responsive gap */}
              <span className="text-xs md:text-sm font-semibold bg-primary text-primary-foreground rounded-full w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                {dayData.day}
              </span>{" "}
              {/* Responsive size */}
              <span className="text-base md:text-lg font-semibold text-primary truncate">
                {dayData.title || `Day ${dayData.day}`}
              </span>{" "}
              {/* Responsive text size */}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 md:px-6 md:pb-6 pt-0">
            {" "}
            {/* Responsive padding */}
            <div className="space-y-3 md:space-y-4 mt-3 md:mt-4">
              {" "}
              {/* Responsive spacing */}
              {dayData.activities && dayData.activities.length > 0 ? (
                dayData.activities.map((activity, index) => {
                  // Handle both new object format and old string format
                  const isObjectFormat =
                    typeof activity === "object" && activity !== null;
                  const description = isObjectFormat
                    ? (activity as ActivityDetail).description
                    : (activity as string);
                  const time = isObjectFormat
                    ? (activity as ActivityDetail).time
                    : null;
                  const cost = isObjectFormat
                    ? (activity as ActivityDetail).estimated_cost
                    : null;
                  const booking = isObjectFormat
                    ? (activity as ActivityDetail).booking_info
                    : null;
                  const alternatives = isObjectFormat
                    ? (activity as ActivityDetail).alternatives
                    : null;

                  return (
                    <div
                      key={index}
                      className="flex items-start text-sm border-l-2 border-accent pl-3 md:pl-4 py-2 bg-secondary/20 rounded-r-md"
                    >
                      {" "}
                      {/* Responsive padding */}
                      {getActivityIcon(description)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm md:text-base">
                          {description}
                        </p>{" "}
                        {/* Responsive text size */}
                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{time}</span>
                            </div>
                          )}
                          {cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>Est. Cost: {cost}</span>
                            </div>
                          )}
                          {booking && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>Booking: {booking}</span>
                            </div>
                          )}
                          {alternatives && (
                            <div className="flex items-center gap-1">
                              <Shuffle className="w-3 h-3" />
                              <span>Alt: {alternatives}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="w-4 h-4 mr-2 shrink-0" /> No specific
                  activities listed for this day.
                </div>
              )}
            </div>
            {dayData.notes && (
              <div className="mt-4 md:mt-6 p-3 bg-primary/10 border-l-4 border-primary rounded-r-md">
                {" "}
                {/* Responsive margin */}
                <p className="text-xs md:text-sm font-semibold text-primary mb-1">
                  Notes:
                </p>{" "}
                {/* Responsive text size */}
                <p className="text-xs md:text-sm text-primary/90">
                  {dayData.notes}
                </p>{" "}
                {/* Responsive text size */}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
