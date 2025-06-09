"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Import useFormField if needed directly, but it's used internally by Form components
import { useToast } from "@/hooks/use-toast";
import { generateTravelPlan } from "@/actions/generate-plan";
import {
  MapPin,
  CalendarDays,
  Sparkles,
  Wallet,
  Loader2,
  Send,
} from "lucide-react"; // Import icons

const budgetOptions = ["Budget-friendly", "Mid-range", "Luxury"];

const formSchema = z.object({
  destination: z
    .string()
    .min(2, { message: "Destination must be at least 2 characters." })
    .max(100, { message: "Destination too long." }), // Added max length
  days: z.coerce
    .number()
    .int()
    .min(1, { message: "Must travel for at least 1 day." })
    .max(30, { message: "Maximum trip duration is 30 days." }),
  interests: z
    .string()
    .min(3, { message: "Please list at least one interest." })
    .max(300, { message: "Interests list too long." }), // Added max length
  budget: z
    .string()
    .refine((value) => budgetOptions.includes(value), {
      message: "Please select a valid budget level.",
    }),
});

type GeneratePlanFormValues = z.infer<typeof formSchema>;

interface GeneratePlanFormProps {
  userId: string;
}

export default function GeneratePlanForm({ userId }: GeneratePlanFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<GeneratePlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: "",
      days: 3,
      interests: "",
      budget: budgetOptions[1], // Default to Mid-range
    },
  });

  async function onSubmit(values: GeneratePlanFormValues) {
    setIsGenerating(true);
    toast({
      title: "🚀 Generating Your Itinerary...",
      description:
        "Our AI is crafting your personalized travel plan. Please wait a moment!",
      duration: 8000, // Longer duration for generation
    });

    try {
      // Use the server action
      const result = await generateTravelPlan({
        userId,
        destination: values.destination,
        days: values.days,
        interests: values.interests, // Pass the string directly
        budget: values.budget,
      });

      if (result.success && result.planId) {
        toast({
          title: "✨ Itinerary Generated Successfully!",
          description: "Redirecting you to view your amazing travel plan.",
          duration: 5000,
        });
        // Delay redirect slightly to allow toast to be seen
        setTimeout(() => {
          router.push(`/plan/${result.planId}`);
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to generate or save the plan.");
      }
    } catch (error) {
      console.error("Error generating travel plan:", error);
      toast({
        variant: "destructive",
        title: "⚠️ Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please check your input and try again.",
        duration: 10000, // Longer duration for error
      });
      setIsGenerating(false); // Re-enable form on error
    }
    // Keep generating true on success until redirect
  }

  return (
    <Card className="w-full shadow-xl rounded-lg">
      {" "}
      {/* Increased shadow and rounding */}
      <CardHeader className="pb-2 pt-4 md:pt-6 px-4 md:px-6">
        {" "}
        {/* Adjusted padding */}
        {/* Removed title from here, page provides it */}
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
            {" "}
            {/* Responsive padding and spacing */}
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                    {" "}
                    {/* Responsive text */}
                    <MapPin className="w-4 h-4 text-primary" /> {/* Icon */}
                    Destination
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Kyoto, Japan"
                      {...field}
                      disabled={isGenerating}
                      className="text-sm md:text-base"
                    />{" "}
                    {/* Responsive text */}
                  </FormControl>
                  <FormMessage className="text-xs" />{" "}
                  {/* Smaller error message */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                    {" "}
                    {/* Responsive text */}
                    <CalendarDays className="w-4 h-4 text-primary" />{" "}
                    {/* Icon */}
                    Number of Days
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 7"
                      {...field}
                      disabled={isGenerating}
                      min="1"
                      max="30"
                      className="text-sm md:text-base"
                    />{" "}
                    {/* Added min/max, Responsive text */}
                  </FormControl>
                  <FormMessage className="text-xs" />{" "}
                  {/* Smaller error message */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                    {" "}
                    {/* Responsive text */}
                    <Sparkles className="w-4 h-4 text-primary" /> {/* Icon */}
                    Interests & Activities
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., historical temples, street food tasting, bamboo forest walk, tea ceremony"
                      {...field}
                      disabled={isGenerating}
                      rows={3} // Adjust rows
                      className="text-sm md:text-base" // Responsive text
                    />
                  </FormControl>
                  <FormDescription className="text-xs md:text-sm">
                    {" "}
                    {/* Responsive text */}
                    Separate your interests with commas (e.g., hiking, museums,
                    local cuisine).
                  </FormDescription>
                  <FormMessage className="text-xs" />{" "}
                  {/* Smaller error message */}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                    {" "}
                    {/* Responsive text */}
                    <Wallet className="w-4 h-4 text-primary" /> {/* Icon */}
                    Budget Level
                  </FormLabel>
                  {/*
                    Correct Handling: For complex components like ShadCN's Select,
                    do NOT wrap them in <FormControl>. Instead, render them directly
                    within <FormItem> and pass the field props manually.
                    The `ref` from `field` should be passed to the `SelectTrigger`.
                    Other props like `name`, `onValueChange`, `defaultValue` are passed to `Select`.
                    This prevents the "React.Children.only" error caused by FormControl's internal Slot.
                  */}
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isGenerating}
                    name={field.name} // Pass name to Select
                  >
                    {/* FormControl removed from here */}
                    <SelectTrigger
                      ref={field.ref}
                      className="w-full text-sm md:text-base"
                    >
                      {" "}
                      {/* Pass ref to SelectTrigger, Responsive text */}
                      <SelectValue placeholder="Select your budget preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs md:text-sm">
                    {" "}
                    {/* Responsive text */}
                    Helps tailor recommendations (e.g., accommodation, dining).
                  </FormDescription>
                  <FormMessage className="text-xs" />{" "}
                  {/* Smaller error message */}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="px-4 md:px-6 pb-4 md:pb-6 pt-4">
            {" "}
            {/* Responsive padding */}
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-base md:text-lg py-3 md:py-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              disabled={isGenerating}
            >
              {" "}
              {/* Responsive size */}
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />{" "}
                  {/* Responsive loader */}
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4 md:h-5 md:w-5" />{" "}
                  {/* Responsive icon */}
                  Generate My Itinerary
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
