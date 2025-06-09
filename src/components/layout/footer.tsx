import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/ashutoshswamy";
  const linkedinUrl = "https://linkedin.com/in/ashutoshswamy";

  return (
    <footer className="bg-muted/50 dark:bg-gray-900 text-muted-foreground dark:text-gray-300 py-6 md:py-8">
      {" "}
      {/* Adjusted padding */}
      <div className="container mx-auto">
        {" "}
        {/* Removed horizontal padding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          {" "}
          {/* Adjusted gap and margin */}
          {/* Column 1: App Info */}
          <div className="text-center md:text-left">
            <h3 className="text-base md:text-lg font-semibold text-foreground dark:text-white mb-2">
              TravelSynth
            </h3>{" "}
            {/* Adjusted text size */}
            <p className="text-xs md:text-sm">
              {" "}
              {/* Adjusted text size */}
              Personalized travel planning, powered by AI. Craft your perfect
              journey with custom itineraries.
            </p>
            {/* Optional: Add a Disclaimer link/text if needed */}
            {/* <Link href="/disclaimer" className="text-sm hover:underline mt-2 block">Disclaimer</Link> */}
          </div>
          {/* Column 2: Empty or for other links */}
          <div>
            {/* Add other links here if needed, e.g., About Us, Contact, FAQ */}
          </div>
          {/* Column 3: Connect with Us */}
          <div className="text-center md:text-right">
            <h3 className="text-base md:text-lg font-semibold text-foreground dark:text-white mb-2">
              Connect with Us
            </h3>{" "}
            {/* Adjusted text size */}
            <div className="flex justify-center md:justify-end space-x-4 mb-2">
              <Link
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
              >
                <Github className="h-5 w-5 md:h-6 md:h-6 text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors" />{" "}
                {/* Adjusted icon size */}
              </Link>
              <Link
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5 md:h-6 md:h-6 text-muted-foreground dark:text-gray-300 hover:text-primary dark:hover:text-accent transition-colors" />{" "}
                {/* Adjusted icon size */}
              </Link>
            </div>
            <p className="text-xs md:text-sm">Developer: Ashutosh Swamy</p>{" "}
            {/* Adjusted text size */}
          </div>
        </div>
        <Separator className="bg-border dark:bg-gray-700 my-6 md:my-8" />{" "}
        {/* Adjusted margin */}
        <div className="text-center text-xs md:text-sm">
          {" "}
          {/* Adjusted text size */}© {currentYear} TravelSynth. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}
