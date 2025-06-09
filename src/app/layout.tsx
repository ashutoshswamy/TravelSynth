import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google"; // Import Poppins via next/font
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SupabaseProvider from "@/components/providers/supabase-provider";
import Footer from "@/components/layout/footer"; // Import the Footer component

// Configure Poppins font
const poppins = Poppins({
  variable: "--font-poppins", // Assign to CSS variable
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Include desired weights
});

// Define the base URL for metadata resolution (replace with your actual domain)
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://travelsynth.vercel.app"; // Fallback for local dev

export const metadata: Metadata = {
  // Provides a base for resolving relative URLs within the metadata object.
  metadataBase: new URL(siteUrl),
  // Default title, can be extended by pages using title.template
  title: {
    default: "TravelSynth - AI-Powered Travel Planner",
    template: "%s | TravelSynth", // Page titles will be appended like "Dashboard | TravelSynth"
  },
  // Comprehensive description for SEO
  description:
    "Generate personalized travel itineraries effortlessly with TravelSynth. Our AI crafts detailed plans based on your destination, dates, interests, and budget. Plan your perfect trip today!",
  // Keywords for SEO (less impactful for Google but good practice)
  keywords: [
    "travel planner",
    "AI travel",
    "itinerary generator",
    "trip planner",
    "personalized travel",
    "travel AI",
    "TravelSynth",
  ],
  // Open Graph tags for social media sharing
  openGraph: {
    title: "TravelSynth - AI-Powered Travel Planner",
    description:
      "Generate personalized travel itineraries effortlessly with TravelSynth AI.",
    url: siteUrl, // Canonical URL of the website
    siteName: "TravelSynth",
    // TODO: Replace with an actual URL to a compelling image for social sharing (e.g., logo or hero image)
    // images: [
    //   {
    //     url: '/og-image.png', // Path relative to metadataBase
    //     width: 1200,
    //     height: 630,
    //     alt: 'TravelSynth AI Travel Planner',
    //   },
    // ],
    locale: "en_US",
    type: "website", // Type of content
  },
  // Twitter Card tags for Twitter sharing
  twitter: {
    card: "summary_large_image", // Type of card
    title: "TravelSynth - AI-Powered Travel Planner",
    description:
      "Generate personalized travel itineraries effortlessly with TravelSynth AI.",
    // TODO: Replace with the same image URL as og:image
    // images: ['/twitter-image.png'], // Path relative to metadataBase
    // TODO: Add your Twitter handle if applicable
    // site: '@yourTwitterHandle',
    // creator: '@yourTwitterHandle',
  },
  // Robots directives for search engine crawlers
  robots: {
    index: true, // Allow indexing of the site
    follow: true, // Allow following links
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Icons (optional, but good for branding)
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  // },
  // Manifest file for PWA capabilities (optional)
  // manifest: '/site.webmanifest',
};

// Define viewport settings
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // themeColor: [ // Example theme color for browser UI
  //   { media: '(prefers-color-scheme: light)', color: '#F0EAD6' }, // Light beige
  //   { media: '(prefers-color-scheme: dark)', color: '#2E4033' }, // Dark green-grey approx.
  // ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the Poppins font variable to the html tag
    <html lang="en" className={`${poppins.variable}`}>
      {/* Add suppressHydrationWarning to ignore attributes added by extensions like cz-shortcut-listen */}
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="icon.png"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="apple-icon.png"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={`antialiased`} suppressHydrationWarning={true}>
        <SupabaseProvider>
          <main>{children}</main> {/* Main content area */}
          <Toaster />
          <Footer /> {/* Add the Footer component here */}
        </SupabaseProvider>
      </body>
    </html>
  );
}
