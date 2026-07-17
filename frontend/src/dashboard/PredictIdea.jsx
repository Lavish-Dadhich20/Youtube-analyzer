import { useState } from "react";
import { predictVideoIdea } from "../services/api";
import ScoreCircle from "../components/ScoreCircle";
import { AnalyzeSkeleton } from "../components/Skeleton";
import ReactMarkdown from "react-markdown";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import useVoiceInput from "../hooks/useVoiceInput";

function PredictIdea() {
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const { listening, supported, startListening, stopListening } = useVoiceInput(
    (text) => setIdea(text)
  );

  const categories = [
    "general", "education", "entertainment", "gaming",
    "technology", "music", "sports", "news",
    "comedy", "lifestyle", "finance",
  ];

  const handlePredict = async () => {
    if (!idea) {
      setError("Please describe your video idea.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictVideoIdea(idea, "", category);
      setResult(data);
    } catch (err) {
      setError("Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sentimentToScore = (sentiment) => {
    if (!sentiment) return 50;
    const label = sentiment?.sentiment?.toLowerCase() || "";
    if (label.includes("pos")) return 85;
    if (label.includes("neg")) return 20;
    return 50;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Predict Idea</h2>
        <p className="text-gray-400 text-sm">
          Describe your video idea and AI will predict how it performs before you film it.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">Your Video Idea</label>
          <div className="relative">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. 10 Python tips every beginner should know... or click mic to speak"
              rows={3}
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 resize-none"
            />
            {supported && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`absolute right-3 top-3 transition ${
                  listening ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-white"
                }`}
                title={listening ? "Stop listening" : "Speak your idea"}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black border border-gray-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-600"
          >
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <Zap size={16} />
          {loading ? "Predicting..." : "Predict Performance"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading && <AnalyzeSkeleton />}

      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-900 border border-gray-800 rounded-xl p-6 justify-items-center">
            <ScoreCircle
              score={result.title_analysis?.score ?? 0}
              label="Title Score"
            />
            <ScoreCircle
              score={sentimentToScore(result.sentiment)}
              label="Sentiment"
            />
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm mb-1">Category</p>
              <p className="text-2xl font-extrabold text-white capitalize">
                {result.category?.category || category}
              </p>
            </div>
          </div>

          {result.title_analysis?.suggestions?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-3 text-white">Title Suggestions</h3>
              <ul className="space-y-2">
                {result.title_analysis.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-red-500 mt-0.5">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-white">AI Prediction</h3>
            <div className="text-gray-300 leading-relaxed chat-markdown">
              <ReactMarkdown>{result.ai_prediction}</ReactMarkdown>
            </div>
            <p className="text-gray-500 text-sm mt-4">Powered by {result.ai_used}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3 text-white">Trend Analysis</h3>
            <div className="text-gray-300 leading-relaxed chat-markdown">
              <ReactMarkdown>
                {typeof result.trend_score === "string"
                  ? result.trend_score
                  : JSON.stringify(result.trend_score)}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default PredictIdea;