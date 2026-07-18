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
    <div className="space-y-6">
      <div>
        <p className="text-red-500 font-semibold text-xs tracking-widest mb-1">
          YOUTUBER DASHBOARD
        </p>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {data.user}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {data.verified
            ? `Connected as ${data.channel_name} · Verified via Google`
            : "Connect your YouTube channel to unlock full analytics"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-red-500" />
            <p className="text-gray-400 text-xs font-medium">SUBSCRIBERS</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(data.subscriber_count || 0)}
          </p>
          {!data.verified && (
            <p className="text-gray-600 text-xs mt-1">Connect channel to see</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Video size={16} className="text-red-500" />
            <p className="text-gray-400 text-xs font-medium">TOTAL VIDEOS</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(data.video_count || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-red-500" />
            <p className="text-gray-400 text-xs font-medium">TOTAL VIEWS</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatNumber(data.total_views || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            {data.verified ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <AlertCircle size={16} className="text-yellow-500" />
            )}
            <p className="text-gray-400 text-xs font-medium">STATUS</p>
          </div>
          <p className={`text-lg font-bold ${data.verified ? "text-green-500" : "text-yellow-500"}`}>
            {data.verified ? "Verified" : "Unverified"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm mb-4 font-medium">Channel Health Score</p>
          <ScoreCircle score={healthScore()} label="Overall Health" />
          <p className="text-gray-500 text-xs mt-4 text-center">
            {data.verified
              ? "Based on your channel data"
              : "Connect your channel for accurate score"}
          </p>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">AI Growth Advice</h3>
          <div className="text-gray-300 text-sm leading-relaxed chat-markdown overflow-y-auto max-h-64">
            <ReactMarkdown>{data.ai_advice}</ReactMarkdown>
          </div>
          <p className="text-gray-600 text-xs mt-3">Powered by {data.ai_used}</p>
        </div>
      </div>

      {!data.verified && (
        <div className="bg-gray-900 border border-yellow-600 border-dashed rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold mb-1">Connect your YouTube channel</p>
            <p className="text-gray-400 text-sm">
              Verify ownership to unlock real analytics, subscriber data, and personalized AI insights.
            </p>
          </div>
          <a
            href={`${BACKEND_URL}/auth/youtube/login`}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
          >
            Connect Now →
          </a>
        </div>
      )}
    </div>
  );
}

export default Overview;