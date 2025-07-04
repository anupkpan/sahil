import React from "react";
import { Listbox } from "@headlessui/react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

// Expanded prompt options
const moods = [
  "ग़ालिब",
  "जावेद अख़्तर",
  "गुलज़ार",
  "राहत इंदोरी",
  "जौन एलिया",
  "बशीर बद्र",
  "ताहज़ीब हाफ़ी",
  "इश्क़",
  "प्यार",
  "तन्हाई",
  "ग़म",
  "ख़ुशी",
  "यादें"
];

const themes = [
  "दर्द",
  "मोहब्बत",
  "तन्हाई",
  "विरह",
  "इश्क़",
  "ज़िंदगी",
  "यादें",
  "चाँद",
  "बारिश",
  "समंदर",
  "ग़ज़ल"
];

const popularSuggestions = [
  "ग़ालिब + दर्द",
  "जावेद अख़्तर + मोहब्बत",
  "गुलज़ार + तन्हाई",
  "राहत इंदोरी + इश्क़",
  "जौन एलिया + ज़िंदगी",
  "बशीर बद्र + विरह"
];

export default function PromptControls({
  mood,
  setMood,
  theme,
  setTheme,
  depth,
  setDepth,
  onGenerate,
  isLoading,
}: {
  mood: string;
  setMood: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  depth: number;
  setDepth: (value: number) => void;
  onGenerate: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-6 text-white max-w-xl mx-auto p-4 bg-black/40 rounded-2xl shadow-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-center mb-4 text-blue-300">
        अपनी शायरी चुनें
      </h2>

      {/* Mood Dropdown */}
      <Dropdown label="भावना चुनें" value={mood} onChange={setMood} options={moods} />

      {/* Theme Dropdown */}
      <Dropdown label="विषय चुनें" value={theme} onChange={setTheme} options={themes} />

      {/* Suggestions */}
      <div className="text-sm text-blue-200 mt-2">
        <div className="font-semibold mb-1">लोकप्रिय संयोजन:</div>
        <div className="flex flex-wrap gap-2">
          {popularSuggestions.map((combo) => (
            <button
              key={combo}
              className={`px-3 py-1 rounded-full text-white text-xs border border-white/20 transition-colors whitespace-nowrap ${
                combo === "ग़ालिब + दर्द" ? "bg-pink-900 hover:bg-pink-800 font-semibold" : "bg-white/10 hover:bg-white/20"
              }`}
              onClick={() => {
                const [m, t] = combo.split(" + ");
                setMood(m);
                setTheme(t);
              }}
            >
              {combo}
            </button>
          ))}
        </div>
      </div>

      {/* Depth Slider */}
      <div className="text-center">
        <label className="block mb-1">गहराई</label>
        <input
          type="range"
          min="1"
          max="10"
          value={depth}
          onChange={(e) => setDepth(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-blue-200 mt-1 flex justify-center items-center gap-2">
          {depth} / 10
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full bg-primary-blue hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? "सोच रहा हूँ..." : "शायरी दिखाओ"}
        </button>
      </div>
    </div>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="w-full p-3 pr-10 bg-white/10 text-white border border-white/30 rounded-md backdrop-blur-md flex justify-between items-center">
            <span>{value || `-- ${label} --`}</span>
            <FaChevronDown className="ml-2 text-sm text-white" />
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-black/90 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-md border border-white/10">
            {options.map((option) => (
              <Listbox.Option
                key={option}
                value={option}
                className={({ active, selected }) =>
                  `cursor-pointer select-none p-2 ${active ? "bg-white/10" : ""} ${selected ? "text-blue-400" : ""}`
                }
              >
                {({ selected }) => (
                  <span className="flex items-center gap-2">
                    ❤️ {option} {selected && <FaCheck className="ml-auto text-green-400" />}
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
