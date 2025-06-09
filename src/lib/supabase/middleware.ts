import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- Environment variable checks ---
  let configError = false;
  if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
    console.error(
      "❌ Middleware Error: NEXT_PUBLIC_SUPABASE_URL environment variable is missing or set to the placeholder value."
    );
    configError = true;
  }
  if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
    console.error(
      "❌ Middleware Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing or set to the placeholder value."
    );
    configError = true;
  }

  // --- URL Validity Check ---
  if (supabaseUrl && supabaseUrl !== "YOUR_SUPABASE_URL") {
    try {
      new URL(supabaseUrl);
    } catch (e) {
      console.error(
        `❌ Middleware Error: NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${supabaseUrl}".`
      );
      // Consider returning an error response if the format is invalid
      // return new NextResponse(`Internal Server Error: Invalid Supabase URL format configured`, { status: 500 });
      configError = true;
    }
  }

  // If configuration is fundamentally broken, log and return without attempting Supabase interaction.
  if (configError) {
    console.error(
      "Middleware: Aborting Supabase session update due to configuration errors."
    );
    // Return the original response without modifying cookies or attempting auth
    return response;
  }
  // --- End Checks ---

  // If checks pass, proceed to create client and update session
  const supabase = createServerClient<Database>(
    // We can now safely use the validated variables
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request cookies and response cookies
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request cookies and response cookies
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Attempt to refresh session cookie
  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error(
      "Middleware: Error getting user during session update:",
      error
    );
    // Decide if you want to return an error response here or just log
    // return new NextResponse('Internal Server Error: Could not verify user session', { status: 500 });
  }

  return response;
}
