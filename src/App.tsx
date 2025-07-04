import React, { useState, useCallback } from "react";
import PromptControls from "./components/PromptControls";
import ShayariDisplay from "./components/ShayariDisplay";

export default function App() {
  const [mood, setMood] = useState<string>("");
  const [theme, setTheme] = useState<string>("");
  const [depth, setDepth] = useState<number>(5);
  const [shayari, setShayari] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      setShayari(data.lines.join("\n")); // ✅ Fix: Use `lines` from API
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
    <div className="flex flex-col min-h-screen w-full">
      {/* TOP RIGHT CORNER BRANDING */}
      <div className="fixed top-4 right-4 text-right text-white z-20">
        <h1 className="text-3xl font-bold drop-shadow-lg text-blue-300">साहिल</h1>
        <p className="text-base drop-shadow text-gray-300">जज़्बातों की आवाज़</p>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="bg-dark-glass w-full">
          {error && (
            <div className="bg-red-700 text-white p-3 rounded-md mb-4 text-center">
              {error}
            </div>
          )}

          <PromptControls
            mood={mood}
            setMood={setMood}
            theme={theme}
            setTheme={setTheme}
            depth={depth}
            setDepth={setDepth}
            onGenerate={generateShayari}
            isLoading={isLoading}
          />

          <ShayariDisplay shayari={shayari} isLoading={isLoading} source={source} />
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        &copy; {new Date().getFullYear()} Sahil - जज़्बातों की आवाज़. All rights reserved.
      </footer>
    </div>
  );
}
