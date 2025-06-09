"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export function createClient() {
  // Create a supabase client on the browser with project's credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Environment variable checks ---
  if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    console.error(
      "❌ Misconfiguration: NEXT_PUBLIC_SUPABASE_URL environment variable is missing or is set to the placeholder value."
    );
    // Throw a specific error to stop execution and inform the developer
    throw new Error(
      "Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env file."
    );
  }
  if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.error(
      "❌ Misconfiguration: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing or is set to the placeholder value."
    );
    // Throw a specific error
    throw new Error(
      "Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    );
  }

  // Validate the URL format before passing it to the Supabase client constructor
  try {
    new URL(supabaseUrl);
  } catch (e) {
    console.error(
      `❌ Misconfiguration: NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${supabaseUrl}"`
    );
    // Throw a specific error for invalid URL format
    throw new Error(
      `Invalid Supabase URL format provided: "${supabaseUrl}". Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.`
    );
  }
  // --- End Checks ---

  // If checks pass, create and return the client
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
