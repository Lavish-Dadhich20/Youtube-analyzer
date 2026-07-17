import { useState, useEffect } from "react";
import { analyzeVideoUrl } from "../services/api";
import { formatNumber } from "../services/format";
import ScoreCircle from "../components/ScoreCircle";
import { AnalyzeSkeleton } from "../components/Skeleton";
import ReactMarkdown from "react-markdown";
import { Search, Play, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import useVoiceInput from "../hooks/useVoiceInput";

function AnalyzeVideo({ data }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [channelVideos, setChannelVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const { listening, supported, startListening, stopListening } = useVoiceInput(
    (text) => setUrl(text)
  );

  const hasChannel = data.verified && data.channel_id;

  useEffect(() => {
    if (hasChannel) {
      fetchChannelVideos();
    }
  }, [hasChannel]);

  const fetchChannelVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${data.channel_id}&maxResults=12&order=date&type=video&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );
      const json = await res.json();
      setChannelVideos(json.items || []);
    } catch (err) {
      console.error("Could not fetch channel videos:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleAnalyze = async (videoUrl) => {
    const targetUrl = videoUrl || url;
    if (!targetUrl) {
      setError("Please paste a YouTube URL.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/analyze/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: targetUrl }),
      });
      const analysisData = await res.json();
      setResult(analysisData);
      if (videoUrl) setUrl(targetUrl);
    } catch (err) {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Analyze Video</h2>
        <p className="text-gray-400 text-sm">
          Paste any YouTube URL or pick a video from your channel to analyze.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
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
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading && <AnalyzeSkeleton />}

      {!loading && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start bg-gray-900 border border-gray-800 rounded-xl p-6">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-full sm:w-48 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-xl font-bold break-words text-white">{result.title}</h2>
              <p className="text-gray-400">{result.channel}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
                <span>{formatNumber(result.views)} views</span>
                <span>{formatNumber(result.likes)} likes</span>
                <span>{formatNumber(result.comments)} comments</span>
              </div>
              <a
                href={`https://youtube.com/watch?v=${result.video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-red-500 hover:text-red-400 text-xs mt-3 font-semibold"
              >
                <ExternalLink size={12} /> Watch on YouTube
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-900 border border-gray-800 rounded-xl p-6 justify-items-center">
            <ScoreCircle score={result.title_analysis?.score ?? 0} label="Title Score" />
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
            <h3 className="text-lg font-bold mb-3 text-white">AI Analysis</h3>
            <div className="text-gray-300 leading-relaxed chat-markdown">
              <ReactMarkdown>{result.ai_analysis}</ReactMarkdown>
            </div>
            <p className="text-gray-500 text-sm mt-4">Powered by {result.ai_used}</p>
          </div>
        </motion.div>
      )}

      {hasChannel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">Your Channel Videos</h3>
            <span className="text-gray-500 text-xs">Click any video to analyze it</span>
          </div>

          {loadingVideos && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-video bg-gray-800" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-3 bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingVideos && channelVideos.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <Play size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No videos found on your channel yet.</p>
            </div>
          )}

          {!loadingVideos && channelVideos.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {channelVideos.map((video, i) => (
                <motion.button
                  key={video.id?.videoId || i}
                  onClick={() =>
                    handleAnalyze(
                      `https://youtube.com/watch?v=${video.id?.videoId}`
                    )
                  }
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600 transition text-left w-full"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={video.snippet?.thumbnails?.medium?.url}
                    alt={video.snippet?.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="p-3">
                    <p className="text-white text-sm font-semibold line-clamp-2">
                      {video.snippet?.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(video.snippet?.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      )}

      {!hasChannel && (
        <div className="bg-gray-900 border border-yellow-700 border-dashed rounded-xl p-6 text-center">
          <p className="text-white font-bold mb-2">Connect your YouTube channel</p>
          <p className="text-gray-400 text-sm mb-4">
            Verify your channel to browse and analyze your own videos directly here.
          </p>
          <a
            href="http://localhost:8000/auth/youtube/login"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition inline-block"
          >
            Connect Channel →
          </a>
        </div>
      )}
    </div>
  );
}

export default AnalyzeVideo;