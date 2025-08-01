// src/components/GameModeSelector.tsx

import React from "react";

interface GameModeSelectorProps {
  onSelect: (mode: "english" | "math") => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({ onSelect }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">🎯 Choose Game Mode</h1>
      <p className="text-gray-600 mb-6">Play and get smarter!</p>

      <div className="space-y-4">
        <button
          onClick={() => onSelect("english")}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition text-lg"
        >
          🔤 English: Unscramble Words
        </button>
        <button
          onClick={() => onSelect("math")}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-lg transition text-lg"
        >
          ➕ Math: Solve Equations
        </button>
      </div>
    </div>
  );
};