import React, { useState, useEffect, useCallback } from "react";
import { nameList } from "./data/names";
import { scrambleName } from "./utils/scamble";
import { generateMathProblem } from "./utils/generateMath";
import { ProgressBar } from "./components/ProgressBar";
import { GameModeSelector } from "./components/GameModeSelector";
import IMG_0332 from './images/IMG_0332.jpeg';

type GameMode = "english" | "math" | null;

interface Question {
  question: string;
  answer: string | number;
}

const App: React.FC = () => {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // User interaction
  const [userAnswer, setUserAnswer] = useState("");
  const [message, setMessage] = useState("");

  // Timing
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optimized question generation with chunking
  const generateQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newQuestions: Question[] = [];
      const usedWords = new Set<string>();
      const batchSize = 2; // Process questions in small batches
      let batchCount = 0;

      const generateBatch = async () => {
        while (newQuestions.length < 10 && batchCount < 5) {
          batchCount++;
          await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread

          for (let i = 0; i < batchSize && newQuestions.length < 10; i++) {
            try {
              if (gameMode === "english") {
                const minLength = Math.min(4 + Math.floor(stage / 2), 8);
                let candidates = nameList.filter(w => w.length >= minLength);
                if (candidates.length === 0) candidates = [...nameList];
                candidates = candidates.filter(w => !usedWords.has(w));
                if (candidates.length === 0) {
                  usedWords.clear();
                  candidates = [...nameList];
                }
                const word = candidates[Math.floor(Math.random() * candidates.length)];
                usedWords.add(word);
                newQuestions.push({
                  question: scrambleName(word),
                  answer: word.toUpperCase(),
                });
              } 
              else if (gameMode === "math") {
                const { question, answer } = generateMathProblem(stage);
                newQuestions.push({ question, answer });
              }
            } catch (err) {
              console.error("Error generating question:", err);
              newQuestions.push({
                question: "1 + 1 = ?",
                answer: 2,
              });
            }
          }
          // Update state with current batch
          setQuestions([...newQuestions]);
        }
      };

      await generateBatch();

      if (newQuestions.length === 0) {
        throw new Error("Failed to generate any questions");
      }

      setCurrentQuestionIndex(0);
      setScore(0);
      setGameOver(false);
      setTimeLeft(120);
      setUserAnswer("");
      setMessage("");
    } catch (err) {
      console.error("Question generation failed:", err);
      setError("Failed to generate questions. Please try again.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [gameMode, stage]);

  // Start game with optimized loading
  const startGame = async (mode: GameMode) => {
    setGameMode(mode);
    setStage(1);
    setQuestions([]);
    setLoading(true);
    // Small delay to allow UI to update before heavy computation
    await new Promise(resolve => setTimeout(resolve, 50));
    await generateQuestions();
  };

  // Check answer with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questions[currentQuestionIndex]) {
      setMessage("Question missing - generating new ones");
      generateQuestions();
      return;
    }
    const correctAnswer = String(questions[currentQuestionIndex].answer).toLowerCase();
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer;
    setMessage(isCorrect ? "🎉 Correct!" : `❌ The answer was ${correctAnswer}`);
    if (isCorrect) setScore(prev => prev + 10);
    setTimeout(nextQuestion, 1500);
  };

  // Progress to next question or stage
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(120);
    } else {
      setStage(prev => prev + 1);
      generateQuestions();
    }
    setMessage("");
    setUserAnswer("");
  };

  // Timer with cleanup
  useEffect(() => {
    if (!gameMode || gameOver || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setMessage("⏰ Time's up!");
          setTimeout(nextQuestion, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameMode, currentQuestionIndex, questions, gameOver]);

  // Auto-regenerate if questions are empty
  useEffect(() => {
    if (gameMode && questions.length === 0 && !loading) {
      generateQuestions();
    }
  }, [gameMode, questions, loading, generateQuestions]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Handle going back to menu
  const handleBackToMenu = () => {
    setGameMode(null);
    setStage(1);
    setScore(0);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setMessage("");
    setTimeLeft(120);
    setGameOver(false);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Generating Questions...</h2>
          <p className="text-gray-500">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setGameMode(null);
              setError(null);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Render mode selection
  if (!gameMode) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: `url(${IMG_0332})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div> {/* Overlay for readability */}
        <div className="relative z-10">
          <GameModeSelector onSelect={startGame} />
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url(${IMG_0332})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Main content */}
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full relative z-10">
        {/* Back to Menu Button */}
        <button
          onClick={handleBackToMenu}
          className="absolute -top-12 left-0 text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
        >
          ← Back to Menu
        </button>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Stage {stage}</h1>
          <p className="text-gray-600">
            Question {Math.min(currentQuestionIndex + 1, questions.length)}/{questions.length}
          </p>
          <p className="text-lg font-semibold text-blue-600">Score: {score}</p>
          <ProgressBar 
            current={currentQuestionIndex + 1} 
            total={questions.length || 10} 
          />
          <div className="text-lg font-mono text-red-600 font-bold">
            ⏰ {formatTime(timeLeft)}
          </div>
        </div>

        {questions.length > 0 && questions[currentQuestionIndex] ? (
          <>
            <div className="bg-gray-100 text-2xl font-semibold py-4 px-6 rounded-lg mb-6 text-center min-h-20 flex items-center justify-center">
              {questions[currentQuestionIndex].question}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
                autoFocus
                disabled={!!message}
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition disabled:bg-gray-400"
                disabled={!!message}
              >
                Submit Answer
              </button>
            </form>
            {message && (
              <p className={`mt-4 text-lg font-medium text-center ${
                message.includes("🎉") ? "text-green-600" : "text-red-600"
              }`}>
                {message}
              </p>
            )}
          </>
        ) : (
          <div className="text-center text-gray-600 py-8">
            <p className="mb-4">Preparing your questions...</p>
            <button
              onClick={handleBackToMenu}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;