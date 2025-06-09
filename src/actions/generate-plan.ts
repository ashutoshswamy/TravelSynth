"use server";

import { z } from "zod";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server"; // Use server client
import { cookies } from "next/headers";
import type { TablesInsert } from "@/lib/database.types";

// Define expected AI output structure more precisely
interface ActivityDetail {
  time: string; // e.g., "9:00 AM", "Afternoon", "Evening"
  description: string; // More detailed description of the activity
  estimated_cost?: string; // e.g., "$20", "Free", "Included in pass"
  booking_info?: string; // e.g., "Book online in advance", "Tickets at the entrance"
  alternatives?: string; // Optional alternative suggestion
}

interface TravelDay {
  day: number;
  title: string;
  activities: ActivityDetail[]; // Use the detailed structure
  notes?: string;
}

interface TravelPlanOutput {
  days: TravelDay[];
}

// Define the input schema for the server action (remains the same)
const actionInputSchema = z.object({
  userId: z.string().uuid(),
  destination: z.string().min(2),
  days: z.number().int().min(1).max(30),
  interests: z.string().min(3), // Expecting comma-separated string
  budget: z.string(),
});

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  // Optionally throw an error or handle this case as appropriate
  // throw new Error("GEMINI_API_KEY is not configured.");
}

const genAI = new GoogleGenerativeAI(API_KEY || ""); // Initialize with API Key or empty string if not found

async function callGenerativeAI(
  destination: string,
  days: number,
  interests: string,
  budget: string
): Promise<TravelPlanOutput> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    generationConfig: {
      responseMimeType: "application/json", // Request JSON output
    },
  });

  // Updated prompt requesting more detail
  const prompt = `
Create a detailed ${days}-day travel itinerary for ${destination}.
Focus on these interests: ${interests}.
Adhere to a ${budget} budget level.

Return the itinerary STRICTLY in the following JSON format. Do not include any introductory text or markdown formatting like \`\`\`json. Just the raw JSON object.

{
  "days": [
    {
      "day": 1,
      "title": "Arrival and Local Exploration",
      "activities": [
        {
          "time": "Afternoon",
          "description": "Arrive at the main airport/station, transfer to accommodation and check-in.",
          "estimated_cost": "Varies (transport)",
          "booking_info": "Pre-book airport transfer for potentially lower rates."
        },
        {
          "time": "Late Afternoon",
          "description": "Take a walk around the neighborhood, locate nearby amenities (shops, cafes).",
          "estimated_cost": "Free"
        },
        {
          "time": "Evening",
          "description": "Dinner at a highly-rated mid-range local restaurant near your accommodation.",
          "estimated_cost": "$25-$40 per person",
          "alternatives": "Find a local market for street food if available."
        }
      ],
      "notes": "Purchase a multi-day public transport pass upon arrival if cost-effective."
    },
    {
      "day": 2,
      "title": "Cultural Highlights",
      "activities": [
         {
          "time": "9:00 AM",
          "description": "Visit the National Museum, focusing on the historical exhibits.",
          "estimated_cost": "$15",
          "booking_info": "Check opening hours. Tickets usually available at the door."
        },
        {
           "time": "1:00 PM",
           "description": "Lunch at a traditional cafe in the historic district.",
           "estimated_cost": "$15-$25 per person"
        },
        {
           "time": "2:30 PM",
           "description": "Explore the main historic square and surrounding architecture.",
           "estimated_cost": "Free",
           "alternatives": "Consider a guided walking tour if interested in history (extra cost)."
        },
        {
            "time": "7:00 PM",
            "description": "Attend a local cultural performance (e.g., music, dance).",
            "estimated_cost": "$30+",
            "booking_info": "Book tickets online in advance, especially during peak season."
        }
      ],
       "notes": "Wear comfortable shoes for walking."
    }
    // Add more day objects as needed up to the requested number of days (${days}).
    // Ensure each activity includes 'time', 'description', and optionally 'estimated_cost', 'booking_info', and 'alternatives'.
    // Provide specific and actionable details for each activity.
  ]
}
`;

  const generationConfig = {
    temperature: 0.7, // Adjust creativity vs. predictability
    topK: 1,
    topP: 1,
    maxOutputTokens: 8192, // Adjust based on expected itinerary length
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  try {
    // Pass safetySettings and generationConfig with the model call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      // generationConfig: generationConfig, // Re-enable if needed, but responseMimeType is often sufficient
      // safetySettings: safetySettings, // Re-enable if needed
    });
    const response = result.response;
    const text = response.text();

    // Attempt to parse the JSON response
    try {
      const parsedJson: TravelPlanOutput = JSON.parse(text);
      // Basic validation of the parsed structure
      if (!parsedJson || !Array.isArray(parsedJson.days)) {
        throw new Error("Invalid JSON structure received from AI.");
      }
      // TODO: Add more robust validation (e.g., using Zod on the parsed object)
      // to check the structure of TravelDay and ActivityDetail.
      return parsedJson;
    } catch (parseError) {
      console.error("Failed to parse JSON response from AI:", parseError);
      console.error("Raw AI Response Text:", text); // Log the raw text for debugging
      // Try to find JSON within potential markdown fences
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsedJson: TravelPlanOutput = JSON.parse(jsonMatch[1]);
          if (!parsedJson || !Array.isArray(parsedJson.days)) {
            throw new Error("Invalid JSON structure within markdown fences.");
          }
          console.log("Successfully parsed JSON found within markdown fences.");
          return parsedJson;
        } catch (nestedParseError) {
          console.error(
            "Failed to parse JSON even after removing markdown:",
            nestedParseError
          );
        }
      }
      throw new Error(
        `AI returned malformed JSON. Raw response start: ${text.substring(
          0,
          300
        )}...`
      ); // Include more of the raw response
    }
  } catch (error) {
    console.error("Error calling Generative AI:", error);
    // Check for specific API key errors if possible (depends on the SDK)
    if (error instanceof Error && error.message.includes("API key not valid")) {
      throw new Error("Invalid API Key provided for Generative AI service.");
    }
    throw new Error(
      error instanceof Error
        ? `Generative AI Error: ${error.message}`
        : "Failed to generate content from AI."
    );
  }
}

export async function generateTravelPlan(
  input: z.infer<typeof actionInputSchema>
): Promise<{ success: boolean; planId?: string; error?: string }> {
  if (!API_KEY) {
    return {
      success: false,
      error: "Server configuration error: API key not found.",
    };
  }

  const validation = actionInputSchema.safeParse(input);
  if (!validation.success) {
    // Map Zod errors to a user-friendly message
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { success: false, error: `Invalid input data: ${errorMessages}` };
  }

  const {
    userId,
    destination,
    days,
    interests: interestsString,
    budget,
  } = validation.data;

  let aiResponse: TravelPlanOutput;
  try {
    // Call the new AI function directly
    aiResponse = await callGenerativeAI(
      destination,
      days,
      interestsString,
      budget
    );
  } catch (error) {
    console.error("AI generation failed:", error);
    // Pass specific error messages back to the client
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI generation failed.",
    };
  }

  // Validate the structure again after receiving it, before saving
  if (
    !aiResponse ||
    !Array.isArray(aiResponse.days) ||
    aiResponse.days.length === 0
  ) {
    console.error(
      "AI response validation failed: Invalid structure or empty days array.",
      aiResponse
    );
    return {
      success: false,
      error: "AI did not return a valid itinerary structure.",
    };
  }
  // Optional: Add a check for activity details structure if needed

  // Parse interests string back into an array for saving (remains the same)
  const interestsArray = interestsString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Save to Supabase (remains the same)
  const cookieStore = cookies();
  const supabase = createClient();

  const planData: TablesInsert<"travel_plans"> = {
    user_id: userId,
    destination,
    days,
    interests: interestsArray,
    budget,
    ai_response: aiResponse as any, // Cast to Json type expected by Supabase
  };

  const { data: savedPlan, error: dbError } = await (
    await supabase
  )
    .from("travel_plans")
    .insert(planData)
    .select("id") // Select the ID of the newly inserted row
    .single(); // Expect only one row back

  if (dbError) {
    console.error("Database insertion failed:", dbError);
    return { success: false, error: `Database Error: ${dbError.message}` };
  }

  if (!savedPlan || !savedPlan.id) {
    return {
      success: false,
      error: "Failed to save the plan or retrieve its ID.",
    };
  }

  return { success: true, planId: savedPlan.id };
}
