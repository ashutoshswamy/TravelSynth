"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // Import revalidatePath

// Define the input schema for the delete action
const deleteActionInputSchema = z.object({
  planId: z.string().uuid("Invalid Plan ID format."),
  userId: z.string().uuid("Invalid User ID format."),
});

export async function deleteTravelPlan(
  input: z.infer<typeof deleteActionInputSchema>
): Promise<{ success: boolean; error?: string }> {
  const validation = deleteActionInputSchema.safeParse(input);

  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    return { success: false, error: `Invalid input data: ${errorMessages}` };
  }

  const { planId, userId } = validation.data;
  const cookieStore = cookies();
  const supabase = createClient();

  // Verify user owns the plan before deleting (although RLS should also enforce this)
  const { data: plan, error: fetchError } = await (await supabase)
    .from("travel_plans")
    .select("id")
    .eq("id", planId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !plan) {
    console.error(
      "Error fetching plan or plan not found/unauthorized for deletion:",
      fetchError
    );
    return {
      success: false,
      error: "Plan not found or you do not have permission to delete it.",
    };
  }

  // Perform the delete operation
  const { error: deleteError } = await (await supabase)
    .from("travel_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", userId); // Ensure RLS is respected server-side too

  if (deleteError) {
    console.error("Database deletion failed:", deleteError);
    return { success: false, error: `Database Error: ${deleteError.message}` };
  }

  // Revalidate the dashboard path to refresh the list of plans
  revalidatePath("/dashboard");

  return { success: true };
}
