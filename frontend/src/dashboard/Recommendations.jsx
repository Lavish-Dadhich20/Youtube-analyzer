import { useState } from "react";
import { getDashboardRecommendations } from "../services/api";
import ReactMarkdown from "react-markdown";
import { Lightbulb, RefreshCw, TrendingUp, Clock, Tag } from "lucide-react";

function Recommendations({ data }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const result = await getDashboardRecommendations(token);
      setRecommendations(result.recommendations);
    } catch (err) {
      setRecommendations("Failed to load recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickTips = [
    {
      icon: TrendingUp,
      title: "Trending Topics",
      tip: "Create content around trending topics in your niche to maximize discoverability.",
      color: "text-red-500",
    },
    {
      icon: Clock,
      title: "Best Upload Time",
      tip: "Upload between 2PM–4PM on Tuesday or Thursday for maximum initial reach.",
      color: "text-blue-500",
    },
    {
      icon: Tag,
      title: "Tags Strategy",
      tip: "Use 10–15 specific tags. Mix broad (1–2 words) and long-tail (4–5 words) tags.",
      color: "text-green-500",
    },
  ];

  const getGrowthIssues = () => {
    const hasChannel = data.verified;
    const hasVideos = data.video_count > 0;
    const hasSubs = data.subscriber_count > 0;

    if (!hasChannel) {
      return [
        {
          issue: "Channel Not Connected",
          fix: "Connect your YouTube channel via Google OAuth to unlock personalized insights",
          severity: "high",
        },
      ];
    }

    if (!hasVideos) {
      return [
        {
          issue: "No Videos Uploaded Yet",
          fix: "Upload your first video — you can't grow without content!",
          severity: "high",
        },
        {
          issue: "Channel Has No Content",
          fix: "Start with at least 5–10 videos before expecting growth",
          severity: "high",
        },
        {
          issue: "No Upload Schedule",
          fix: "Decide on a posting schedule (e.g. every Tuesday) before you start",
          severity: "medium",
        },
      ];
    }

    const issues = [];

    if (!hasSubs) {
      issues.push({
        issue: "No Subscribers Yet",
        fix: "Share your videos on social media and in relevant communities to get your first subscribers",
        severity: "high",
      });
    }

    if (data.video_count < 10) {
      issues.push({
        issue: `Only ${data.video_count} Video${data.video_count === 1 ? "" : "s"} Uploaded`,
        fix: "YouTube favors channels with consistent content — aim for at least 20 videos",
        severity: "high",
      });
    }

    if (data.video_count > 0 && data.total_views / data.video_count < 1000) {
      issues.push({
        issue: "Low Average Views Per Video",
        fix: "Improve thumbnails and titles — they are the #1 factor in click-through rate",
        severity: "high",
      });
    }

    issues.push(
      {
        issue: "Inconsistent Upload Schedule",
        fix: "Upload at least once per week on the same day to build audience expectation",
        severity: "medium",
      },
      {
        issue: "Weak SEO Optimization",
        fix: "Include your main keyword in the first 3 words of your title and description",
        severity: "medium",
      }
    );

    return issues;
  };

  const growthIssues = getGrowthIssues();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">AI Recommendations</h2>
        <p className="text-gray-400 text-sm">
          Personalized suggestions based on your real channel data.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {quickTips.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Icon size={24} className={`${tip.color} mb-3`} />
              <h4 className="text-white font-bold text-sm mb-2">{tip.title}</h4>
              <p className="text-gray-400 text-sm">{tip.tip}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" size={20} />
            <h3 className="text-white font-bold">Personalized Video Ideas</h3>
          </div>
          <button
            onClick={fetchRecommendations}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Generating..." : "Generate Ideas"}
          </button>
        </div>

        {!recommendations && !loading && (
          <div className="text-center py-8">
            <Lightbulb size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              Click "Generate Ideas" to get AI-powered video recommendations
              based on your channel and current trends.
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="flex justify-center gap-1 mb-3">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
            </div>
            <p className="text-gray-400 text-sm">AI is analyzing your channel...</p>
          </div>
        )}

        {recommendations && !loading && (
          <div className="text-gray-300 text-sm leading-relaxed chat-markdown">
            <ReactMarkdown>{recommendations}</ReactMarkdown>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-1">
          Why Your Channel May Not Be Growing
        </h3>
        <p className="text-gray-500 text-xs mb-4">
          Based on your real channel data
          {data.verified ? ` · ${data.video_count} videos · ${data.subscriber_count} subscribers` : " · No channel connected"}
        </p>
        <div className="space-y-3">
          {growthIssues.map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-gray-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                item.severity === "high" ? "bg-red-500" : "bg-yellow-500"
              }`} />
              <div>
                <p className="text-white text-sm font-semibold">{item.issue}</p>
                <p className="text-gray-400 text-sm mt-0.5">→ {item.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;