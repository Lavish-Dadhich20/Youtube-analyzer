import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { analyzeVideoUrl } from "../services/api";
import { formatNumber } from "../services/format";
import ScoreCircle from "../components/ScoreCircle";
import { AnalyzeSkeleton } from "../components/Skeleton";
import { Mic, MicOff } from "lucide-react";
import useVoiceInput from "../hooks/useVoiceInput";
import ParticleBackground from "../components/ParticleBackground";

function Analyze() {
  const [url, setUrl] = useState("");
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { listening, supported, startListening, stopListening } = useVoiceInput(
    (text) => setUrl(text)
  );

  useEffect(() => {
    const urlFromHome = searchParams.get("url");
    if (!urlFromHome) return;

    // Avoid React setState warnings inside effects by deferring state updates.
    Promise.resolve().then(() => {
      setLoading(true);
      analyzeVideoUrl(urlFromHome)
        .then((data) => {
          setResult(data);
        })
        .catch(() => setError("Analysis failed. Please check the URL and try again."))
        .finally(() => setLoading(false));
    });
  }, [searchParams]);


  const handleAnalyze = async () => {
    if (!url) {
      setError("Please paste a YouTube URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await analyzeVideoUrl(url);
      setResult(data);
    } catch { 
      setError("Analysis failed. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const sentimentToScore = (sentiment) => {
    if (!sentiment) return 50;
    const label = sentiment.toLowerCase();
    if (label.includes("pos")) return 85;
    if (label.includes("neg")) return 20;
    return 50;
  };

  return (
    <div className="min-h-screen text-white px-6 py-12 max-w-4xl mx-auto relative">
      <ParticleBackground count={40} color="255, 50, 50" />
      <div className="relative z-10">
      <h1 className="text-4xl font-bold mb-2">Analyze a YouTube Video</h1>
      <p className="text-gray-400 mb-8">
        Paste any YouTube video URL and get an instant AI-powered verdict.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or speak your URL"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
          />
          {supported && (
            <button
              onClick={listening ? stopListening : startListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                listening ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-white"
              }`}
              title={listening ? "Stop listening" : "Speak URL"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {loading && <AnalyzeSkeleton />}

      {!loading && result && (
        <div className="mt-10 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start bg-gray-900 border border-gray-800 rounded-xl p-6">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-full sm:w-48 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-bold break-words">{result.title}</h2>
              <p className="text-gray-400">{result.channel}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
                <span>{formatNumber(result.views)} views</span>
                <span>{formatNumber(result.likes)} likes</span>
                <span>{formatNumber(result.comments)} comments</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-900 border border-gray-800 rounded-xl p-6 justify-items-center">
            <ScoreCircle
              score={result.title_analysis?.score ?? 0}
              label="Title Score"
            />
            <ScoreCircle
              score={sentimentToScore(result.sentiment?.sentiment)}
              label={`Sentiment: ${result.sentiment?.sentiment || "N/A"}`}
            />
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm mb-1">Category</p>
              <p className="text-2xl font-extrabold text-white capitalize">
                {result.category?.category || "general"}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-3">AI Analysis</h3>
            <div className="text-gray-300 leading-relaxed chat-markdown">
              <ReactMarkdown>{result.ai_analysis}</ReactMarkdown>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Powered by {result.ai_used}
            </p>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Analyze;