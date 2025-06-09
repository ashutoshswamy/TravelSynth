import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Environment variable checks ---
  if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    console.error(
      "❌ Misconfiguration (Server): NEXT_PUBLIC_SUPABASE_URL environment variable is missing or is set to the placeholder value."
    );
    throw new Error(
      "Server Error: Supabase URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL in your .env file."
    );
  }
  if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.error(
      "❌ Misconfiguration (Server): NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing or is set to the placeholder value."
    );
    throw new Error(
      "Server Error: Supabase Anon Key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file."
    );
  }

  // Validate the URL format before passing it to the Supabase client constructor
  try {
    new URL(supabaseUrl);
  } catch (e) {
    console.error(
      `❌ Misconfiguration (Server): NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${supabaseUrl}"`
    );
    throw new Error(
      `Server Error: Invalid Supabase URL format provided: "${supabaseUrl}". Please check your NEXT_PUBLIC_SUPABASE_URL environment variable.`
    );
  }
  // --- End Checks ---

  // Create a server client Supabase client with cookies
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}
