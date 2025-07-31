// src/App.tsx

import React, { useState, useEffect } from "react";
import { nameList } from "./data/names";
import { scrambleName } from "./utils/scamble";

const App: React.FC = () => {
  const [currentName, setCurrentName] = useState<string>("");
  const [scrambled, setScrambled] = useState<string>("");
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [hint, setHint] = useState<string>("");

  // Pick a random name and scramble it
  const pickNewName = () => {
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];
    setCurrentName(randomName);
    setScrambled(scrambleName(randomName));
    setGuess("");
    setMessage("");
    setHint("");
  };

  // Show hint: first and last letter
  const getHint = () => {
    if (currentName.length <= 2) {
      setHint(currentName);
    } else {
      setHint(`${currentName[0]}...${currentName[currentName.length - 1]}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim().toLowerCase() === currentName.toLowerCase()) {
      setMessage("🎉 Correct! Well done!");
    } else {
      setMessage("❌ Incorrect. Try again!");
    }
  };

  // Load first name on mount
  useEffect(() => {
    pickNewName();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">🔤 Scrambled Name Game</h1>
        <p className="text-gray-600 mb-6">Unscramble the name below!</p>

        <div className="bg-gray-100 text-2xl font-semibold py-4 px-6 rounded-lg mb-6">
          {scrambled}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Check Answer
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-lg font-medium ${
              message.includes("Correct") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {hint && (
          <p className="mt-2 text-purple-600 font-medium">💡 Hint: {hint}</p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={getHint}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg transition"
          >
            💡 Hint
          </button>
          <button
            onClick={pickNewName}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
          >
            Next Name
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;