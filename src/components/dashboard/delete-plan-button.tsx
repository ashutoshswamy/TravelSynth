"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteTravelPlan } from "@/actions/delete-plan";
import { useSupabase } from "@/components/providers/supabase-provider"; // To get user ID

interface DeletePlanButtonProps {
  planId: string;
}

export default function DeletePlanButton({ planId }: DeletePlanButtonProps) {
  const { toast } = useToast();
  const { session } = useSupabase(); // Get session which contains user ID
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog state

  const handleDelete = async () => {
    if (!session?.user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User not found. Please log in again.",
      });
      return;
    }
    if (!planId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Plan ID is missing.",
      });
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteTravelPlan({
        planId,
        userId: session.user.id,
      });

      if (result.success) {
        toast({
          title: "🗑️ Plan Deleted",
          description: "The travel plan has been successfully deleted.",
        });
        setIsDialogOpen(false); // Close dialog on success
        // No need to manually refresh, revalidatePath in action handles it
      } else {
        throw new Error(result.error || "Failed to delete the plan.");
      }
    } catch (error) {
      console.error("Error deleting travel plan:", error);
      toast({
        variant: "destructive",
        title: "⚠️ Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
      // Ensure dialog is closed if error happens *after* it should have been closed on success
      if (!isDialogOpen && !isDeleting) {
        // If something went wrong after success (unlikely here), ensure dialog is closed
      } else if (isDeleting) {
        // Don't close dialog if deletion is still technically in progress but failed
      }
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          disabled={isDeleting}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            travel plan and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, delete plan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
