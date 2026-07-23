import { formatNumber } from "../services/format";
import ScoreCircle from "../components/ScoreCircle";
import ReactMarkdown from "react-markdown";
import { Users, Video, Eye, CheckCircle, AlertCircle } from "lucide-react";
import BACKEND_URL from "../services/config";

function Overview({ data }) {
  const healthScore = () => {
    if (!data.verified) return 40;
    const subs = data.subscriber_count || 0;
    const videos = data.video_count || 0;
    if (subs > 100000) return 90;
    if (subs > 10000) return 75;
    if (subs > 1000) return 60;
    if (videos > 0) return 50;
    return 35;
  };

  return (
    <div className="space-y-6 min-w-0 w-full">
      <div className="min-w-0">
        <p className="text-red-500 font-semibold text-xs tracking-widest mb-1">
          YOUTUBER DASHBOARD
        </p>
        <h1 className="text-3xl font-bold text-white break-words">
          Welcome back, {data.user}!
        </h1>
        <p className="text-gray-400 text-sm mt-1 break-words">
          {data.verified
            ? `Connected as ${data.channel_name} · Verified via Google`
            : "Connect your YouTube channel to unlock full analytics"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0 w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-w-0">
            <Users size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">SUBSCRIBERS</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {formatNumber(data.subscriber_count || 0)}
          </p>
          {!data.verified && (
            <p className="text-gray-600 text-xs mt-1 truncate">Connect channel to see</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-w-0">
            <Video size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">TOTAL VIDEOS</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {formatNumber(data.video_count || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-w-0">
            <Eye size={16} className="text-red-500 flex-shrink-0" />
            <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">TOTAL VIEWS</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate">
            {formatNumber(data.total_views || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 sm:p-5 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 min-w-0">
            {data.verified ? (
              <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" />
            )}
            <p className="text-gray-400 text-[10px] sm:text-xs font-medium truncate">STATUS</p>
          </div>
          <p className={`text-base sm:text-lg font-bold truncate ${data.verified ? "text-green-500" : "text-yellow-500"}`}>
            {data.verified ? "Verified" : "Unverified"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 min-w-0 w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-w-0 overflow-hidden">
          <p className="text-gray-400 text-sm mb-4 font-medium">Channel Health Score</p>
          <ScoreCircle score={healthScore()} label="Overall Health" />
          <p className="text-gray-500 text-xs mt-4 text-center">
            {data.verified
              ? "Based on your channel data"
              : "Connect your channel for accurate score"}
          </p>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6 min-w-0 overflow-hidden">
          <h3 className="text-white font-bold mb-4">AI Growth Advice</h3>
          <div
            className="text-gray-300 text-sm leading-relaxed chat-markdown overflow-y-auto max-h-64 break-words"
            style={{ overflowWrap: "anywhere" }}
          >
            <ReactMarkdown>{data.ai_advice}</ReactMarkdown>
          </div>
          <p className="text-gray-600 text-xs mt-3">Powered by {data.ai_used}</p>
        </div>
      </div>

      {!data.verified && (
        <div className="bg-gray-900 border border-yellow-600 border-dashed rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 min-w-0 overflow-hidden">
          <div className="min-w-0">
            <p className="text-white font-bold mb-1">Connect your YouTube channel</p>
            <p className="text-gray-400 text-sm">
              Verify ownership to unlock real analytics, subscriber data, and personalized AI insights.
            </p>
          </div>
          <a
            href={`${BACKEND_URL}/auth/youtube/login`}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap flex-shrink-0"
          >
            Connect Now →
          </a>
        </div>
      )}
    </div>
  );
}

export default Overview;