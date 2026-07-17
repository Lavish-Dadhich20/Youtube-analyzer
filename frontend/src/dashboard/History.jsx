import { useState, useEffect } from "react";
import { getUserHistory } from "../services/api";
import { formatNumber } from "../services/format";
import { History, ExternalLink, TrendingUp } from "lucide-react";
import ScoreCircle from "../components/ScoreCircle";
import { motion } from "framer-motion";

function HistoryPage({ setActiveSection }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const data = await getUserHistory(token);
        setHistory(data.history || []);
      } catch (err) {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-32 h-20 bg-gray-800 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/3" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Video History</h2>
        <p className="text-gray-400 text-sm">
          All videos you've analyzed — {history.length} total
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {!loading && history.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <History size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-white font-bold mb-2">No analyzed videos yet</p>
          <p className="text-gray-400 text-sm mb-6">
            Analyze a YouTube video to see your history here.
          </p>
          <button
            onClick={() => setActiveSection("analyze")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Analyze a Video →
          </button>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4">
          {history.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-red-600 transition"
            >
              <div className="flex gap-4 items-start">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs mb-2">{item.channel}</p>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{formatNumber(item.views)} views</span>
                    <span>•</span>
                    <span>{formatNumber(item.likes)} likes</span>
                    <span>•</span>
                    <span className={`font-semibold ${
                      item.sentiment?.toLowerCase().includes("pos")
                        ? "text-green-500"
                        : item.sentiment?.toLowerCase().includes("neg")
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}>
                      {item.sentiment || "Neutral"}
                    </span>
                    <span>•</span>
                    <span>{new Date(item.analyzed_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-16 relative">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#262626" strokeWidth="10" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={item.title_score >= 70 ? "#00E676" : item.title_score >= 40 ? "#FACC15" : "#FF1A1A"}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - item.title_score / 100)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{item.title_score}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">Title</p>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a
                    href={`https://youtube.com/watch?v=${item.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Watch on YouTube"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href={`/analyze?url=https://youtube.com/watch?v=${item.video_id}`}
                    className="text-gray-400 hover:text-green-500 transition"
                    title="Re-analyze"
                  >
                    <TrendingUp size={16} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;