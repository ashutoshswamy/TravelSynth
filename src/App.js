import React, { useState, useEffect } from "react";
import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import {
  Github,
  Linkedin,
  Map,
  Compass,
  Plane,
  Download,
  Moon,
  Sun,
} from "lucide-react";

const App = () => {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");
  const [transport, setTransport] = useState("");
  const [dietary, setDietary] = useState("");
  const [health, setHealth] = useState("");
  const [avoid, setAvoid] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const generateItinerary = async () => {
    setLoading(true);
    setItinerary("");
    setSaveStatus("");

    const prompt = `Create a personalized travel itinerary for a trip to ${destination} from ${startDate} to ${endDate}.

    Interests: ${interests}
    Budget: ${budget}
    Traveling with: ${travelers}
    Transportation: ${transport}
    Dietary needs: ${dietary}
    Health conditions: ${health}
    Things to avoid: ${avoid}

    Include daily activities, restaurant recommendations, and must-see attractions. Format the result in markdown.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setItinerary(text);
    } catch (error) {
      console.error("Error generating itinerary:", error);
      setItinerary("Failed to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = () => {
    if (!itinerary) return;

    const title = `Travel_Itinerary_${destination.replace(
      /\s+/g,
      "_"
    )}_${startDate}_to_${endDate}`;

    const content = `# Travel Itinerary: ${destination}
## ${startDate} to ${endDate}

### Trip Details
- Destination: ${destination}
- Dates: ${startDate} to ${endDate}
- Interests: ${interests}
- Budget: ${budget}
- Traveling with: ${travelers}
- Transportation: ${transport}
- Dietary needs: ${dietary}
- Health considerations: ${health}
- Things to avoid: ${avoid}

${itinerary}

---
Generated with Travel Itinerary Planner by Ashutosh Swamy
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveStatus("Itinerary saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    }, 100);
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="bg-element plane">
        <Plane size={128} />
      </div>
      <div className="bg-element compass">
        <Compass size={96} />
      </div>
      <div className="bg-element map">
        <Map size={112} />
      </div>

      <div className="app-container">
        <h1>TravelSynth</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Interests (e.g., history, food, hiking)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <input
            type="text"
            placeholder="Budget (e.g., budget, mid-range, luxury)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <input
            type="text"
            placeholder="Traveling with (e.g., family, partner, solo)"
            value={travelers}
            onChange={(e) => setTravelers(e.target.value)}
          />
          <input
            type="text"
            placeholder="Transportation (e.g., public transit, rental car)"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
          />
          <input
            type="text"
            placeholder="Dietary needs (e.g., vegetarian, allergies)"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
          />
          <input
            type="text"
            placeholder="Health conditions to consider"
            value={health}
            onChange={(e) => setHealth(e.target.value)}
          />
          <input
            type="text"
            placeholder="Things to avoid (e.g., crowds, hiking)"
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
          />
          <button onClick={generateItinerary} disabled={loading}>
            {loading ? "Planning your adventure..." : "Generate Itinerary"}
          </button>
        </div>
        {itinerary && (
          <div className="itinerary-container">
            <h2>Your Itinerary</h2>
            <div className="itinerary-actions">
              <button
                className="action-button save-button"
                onClick={saveItinerary}
              >
                <Download size={16} /> Save as Markdown
              </button>
              {saveStatus && <span className="save-status">{saveStatus}</span>}
            </div>
            <ReactMarkdown>{itinerary}</ReactMarkdown>
          </div>
        )}

        <footer className="footer">
          <p>Developed by Ashutosh Swamy</p>
          <div className="dev-links">
            <a
              href="https://github.com/ashutoshswamy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={18} /> GitHub
            </a>
            <a
              href="https://linkedin.com/in/ashutoshswamy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={18} /> LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default App;
