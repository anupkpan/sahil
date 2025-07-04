import React, { useCallback, useState } from "react";
import PromptControls from "./PromptControls";
import ShayariDisplay from "./ShayariDisplay";

const App: React.FC = () => {
  const [shayari, setShayari] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mood, setMood] = useState("गहराई");
  const [theme, setTheme] = useState("ग़ालिब");
  const [depth, setDepth] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const generateShayari = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setShayari("");
    setSource("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, theme, depth }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Shayari.");
      }

      const data = await response.json();

      if (!Array.isArray(data.lines)) {
        throw new Error("Invalid response format from API");
      }

      setShayari(data.lines.join("\n"));
      setSource(data.source || "");
    } catch (err: any) {
      console.error("Error generating Shayari:", err);
      setError(err.message || "शायरी बनाने में कोई समस्या हुई।");
      setShayari("शायरी उपलब्ध नहीं हो पाई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  }, [mood, theme, depth]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-serif">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-center">अपनी शायरी चुनें</h1>
        <PromptControls
          mood={mood}
          theme={theme}
          depth={depth}
          setMood={setMood}
          setTheme={setTheme}
          setDepth={setDepth}
        />
        <button
          onClick={generateShayari}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg w-full"
        >
          {isLoading ? "कृपया प्रतीक्षा करें..." : "शायरी दिखाओ"}
        </button>
        <ShayariDisplay text={shayari} source={source} error={error} />
        <footer className="text-center text-sm opacity-50 pt-10">
          © 2025 Sahil - जज़्बातों की आवाज़. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;
