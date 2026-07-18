import { useState } from "react";
import { compareChannel } from "../services/api";
import { formatNumber, formatCompactNumber } from "../services/format";
import ScoreCircle from "../components/ScoreCircle";
import ReactMarkdown from "react-markdown";
import { Search, Users, Video, Eye, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import BACKEND_URL from "../services/config";

function StatCard({ label, value1, value2, icon: Icon, winner }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-red-500" />
        <p className="text-gray-400 text-xs font-medium uppercase">{label}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={`text-center p-3 rounded-lg ${winner === "you" ? "bg-red-900 bg-opacity-30 border border-red-600" : "bg-gray-800"}`}>
          <p className="text-white font-bold text-lg">{value1}</p>
          {winner === "you" && <p className="text-red-400 text-xs mt-1">✓ Better</p>}
        </div>
        <div className={`text-center p-3 rounded-lg ${winner === "them" ? "bg-green-900 bg-opacity-30 border border-green-600" : "bg-gray-800"}`}>
          <p className="text-white font-bold text-lg">{value2}</p>
          {winner === "them" && <p className="text-green-400 text-xs mt-1">✓ Better</p>}
        </div>
      </div>
    </div>
  );
}

function Compare({ data }) {
  const [searchInput, setSearchInput] = useState("");
  const [competitor, setCompetitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiVerdict, setAiVerdict] = useState("");
  const [loadingVerdict, setLoadingVerdict] = useState(false);

  const hasOwnChannel = data.verified && data.subscriber_count !== undefined;

  const myChannel = {
    channel_name: data.channel_name || data.user,
    channel_thumbnail: data.channel_thumbnail || null,
    channel_url: data.channel_url || "",
    subscriber_count: data.subscriber_count || 0,
    video_count: data.video_count || 0,
    total_views: data.total_views || 0,
    avg_views_per_video: data.video_count > 0
      ? Math.round((data.total_views || 0) / data.video_count)
      : 0,
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError("Please enter a channel URL or @handle.");
      return;
    }
    setLoading(true);
    setError("");
    setCompetitor(null);
    setAiVerdict("");

    try {
      const token = localStorage.getItem("token");
      const result = await compareChannel(searchInput, token);
      setCompetitor(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Channel not found. Try using @handle or full channel URL."
      );
    } finally {
      setLoading(false);
    }
  };

  const getWinner = (myVal, theirVal) => {
    if (myVal > theirVal) return "you";
    if (theirVal > myVal) return "them";
    return "tie";
  };

  const getAiVerdict = async () => {
    if (!competitor) return;
    setLoadingVerdict(true);
    setAiVerdict("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("${BACKEND_URL}/chat/youtuber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Compare these two YouTube channels:

MY CHANNEL (${myChannel.channel_name}):
- Subscribers: ${formatNumber(myChannel.subscriber_count)}
- Videos: ${formatNumber(myChannel.video_count)}
- Total Views: ${formatNumber(myChannel.total_views)}
- Avg Views/Video: ${formatCompactNumber(myChannel.avg_views_per_video)}

COMPETITOR (${competitor.channel_name}):
- Subscribers: ${formatNumber(competitor.subscriber_count)}
- Videos: ${formatNumber(competitor.video_count)}
- Total Views: ${formatNumber(competitor.total_views)}
- Avg Views/Video: ${formatCompactNumber(competitor.avg_views_per_video)}

Give a brief comparison verdict:
1. Who is performing better overall and why?
2. What can MY channel learn from the competitor?
3. What advantages does MY channel have?
Keep it concise — 3-4 sentences max.`,
          history: [],
        }),
      });
      const result = await res.json();
      setAiVerdict(result.response || "");
    } catch (err) {
      setAiVerdict("Failed to get AI verdict. Please try again.");
    } finally {
      setLoadingVerdict(false);
    }
  };

  const scoreChannel = (channel) => {
    const subs = channel.subscriber_count || 0;
    const avgViews = channel.avg_views_per_video || 0;
    let score = 0;
    if (subs > 1000000) score += 40;
    else if (subs > 100000) score += 30;
    else if (subs > 10000) score += 20;
    else if (subs > 1000) score += 10;
    else score += 5;
    if (avgViews > 100000) score += 40;
    else if (avgViews > 10000) score += 30;
    else if (avgViews > 1000) score += 20;
    else if (avgViews > 100) score += 10;
    else score += 5;
    const videos = channel.video_count || 0;
    if (videos > 500) score += 20;
    else if (videos > 100) score += 15;
    else if (videos > 50) score += 10;
    else if (videos > 10) score += 5;
    return Math.min(score, 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Channel Comparison</h2>
        <p className="text-gray-400 text-sm">
          Compare your channel against any competitor on YouTube.
        </p>
      </div>

      {!hasOwnChannel && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-xl p-5">
          <p className="text-yellow-400 text-sm">
            ⚠️ Connect your YouTube channel to compare it with competitors.
          </p>
          <a
            href={`${BACKEND_URL}/auth/youtube/login`}
            className="mt-3 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Connect Channel →
          </a>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <label className="text-sm text-gray-400 block mb-2">
          Enter competitor channel URL or @handle
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="@MrBeast or https://youtube.com/@MrBeast"
              className="w-full bg-black border border-gray-700 rounded-lg pl-9 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
          >
            {loading ? "Searching..." : "Compare"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </div>

      {competitor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              {myChannel.channel_thumbnail ? (
                <img
                  src={myChannel.channel_thumbnail}
                  alt={myChannel.channel_name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-red-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {myChannel.channel_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-white font-bold">{myChannel.channel_name}</p>
              <p className="text-red-500 text-xs mt-1 font-semibold">YOU</p>
              <div className="mt-3">
                <ScoreCircle score={scoreChannel(myChannel)} label="Channel Score" />
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <img
                src={competitor.channel_thumbnail}
                alt={competitor.channel_name}
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-gray-600"
              />
              <p className="text-white font-bold">{competitor.channel_name}</p>
              <a
                href={competitor.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 text-xs mt-1 hover:text-red-400 transition"
              >
                View Channel →
              </a>
              <div className="mt-3">
                <ScoreCircle score={scoreChannel(competitor)} label="Channel Score" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3">
            <div className="grid grid-cols-2 gap-4 text-center text-xs text-gray-400 font-medium">
              <p>{myChannel.channel_name}</p>
              <p>{competitor.channel_name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <StatCard
              label="Subscribers"
              value1={formatCompactNumber(myChannel.subscriber_count)}
              value2={formatCompactNumber(competitor.subscriber_count)}
              icon={Users}
              winner={getWinner(myChannel.subscriber_count, competitor.subscriber_count)}
            />
            <StatCard
              label="Total Videos"
              value1={formatNumber(myChannel.video_count)}
              value2={formatNumber(competitor.video_count)}
              icon={Video}
              winner={getWinner(myChannel.video_count, competitor.video_count)}
            />
            <StatCard
              label="Total Views"
              value1={formatCompactNumber(myChannel.total_views)}
              value2={formatCompactNumber(competitor.total_views)}
              icon={Eye}
              winner={getWinner(myChannel.total_views, competitor.total_views)}
            />
            <StatCard
              label="Avg Views Per Video"
              value1={formatCompactNumber(myChannel.avg_views_per_video)}
              value2={formatCompactNumber(competitor.avg_views_per_video)}
              icon={TrendingUp}
              winner={getWinner(myChannel.avg_views_per_video, competitor.avg_views_per_video)}
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="text-yellow-500" size={20} />
                <h3 className="text-white font-bold">AI Verdict</h3>
              </div>
              <button
                onClick={getAiVerdict}
                disabled={loadingVerdict}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                {loadingVerdict ? "Analyzing..." : aiVerdict ? "Refresh" : "Get AI Verdict"}
              </button>
            </div>

            {!aiVerdict && !loadingVerdict && (
              <p className="text-gray-500 text-sm text-center py-4">
                Click "Get AI Verdict" to get a personalized comparison analysis.
              </p>
            )}

            {loadingVerdict && (
              <div className="flex justify-center gap-1 py-4">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              </div>
            )}

            {aiVerdict && !loadingVerdict && (
              <div className="text-gray-300 text-sm leading-relaxed chat-markdown">
                <ReactMarkdown>{aiVerdict}</ReactMarkdown>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Compare;