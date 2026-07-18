import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import { formatCompactNumber, formatNumber } from "../services/format";
import { BarChart2 } from "lucide-react";
import BACKEND_URL from "../services/config";

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "8px",
  color: "#fff",
};

function EmptyChart({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <BarChart2 size={40} className="text-gray-700 mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

function Analytics({ data }) {
  const hasChannel = data.verified;
  const hasVideos = data.video_count > 0;
  const hasSubs = data.subscriber_count > 0;

  const avgViewsPerVideo =
    hasVideos && data.total_views
      ? Math.floor(data.total_views / data.video_count)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Analytics</h2>
        <p className="text-gray-400 text-sm">
          {hasChannel
            ? "Real data from your verified YouTube channel."
            : "Connect your YouTube channel to see real analytics."}
        </p>
      </div>

      {!hasChannel && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-xl p-5 flex items-center justify-between gap-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ No channel connected. Connect your YouTube channel to unlock real analytics.
          </p>
          <a
            href={`${BACKEND_URL}/auth/youtube/login`}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition"
          >
            Connect Now
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-2">SUBSCRIBERS</p>
          <p className="text-2xl font-bold text-white">
            {hasChannel ? formatNumber(data.subscriber_count || 0) : "—"}
          </p>
          {!hasChannel && <p className="text-gray-600 text-xs mt-1">Connect channel</p>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-2">TOTAL VIDEOS</p>
          <p className="text-2xl font-bold text-white">
            {hasChannel ? formatNumber(data.video_count || 0) : "—"}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-2">TOTAL VIEWS</p>
          <p className="text-2xl font-bold text-white">
            {hasChannel ? formatNumber(data.total_views || 0) : "—"}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-2">AVG VIEWS/VIDEO</p>
          <p className="text-2xl font-bold text-white">
            {avgViewsPerVideo !== null ? formatCompactNumber(avgViewsPerVideo) : "—"}
          </p>
          {!hasVideos && hasChannel && (
            <p className="text-gray-600 text-xs mt-1">Upload videos to see</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Subscriber Growth</h3>
        {!hasChannel ? (
          <EmptyChart message="Connect your YouTube channel to see subscriber growth." />
        ) : !hasSubs ? (
          <EmptyChart message="No subscribers yet. Start uploading videos to grow your audience!" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={[
              { label: "Start", value: 0 },
              { label: "Now", value: data.subscriber_count },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={formatCompactNumber} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [formatCompactNumber(val), "Subscribers"]} />
              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4">Channel Overview</h3>
        {!hasChannel ? (
          <EmptyChart message="Connect your YouTube channel to see video performance." />
        ) : !hasVideos ? (
          <EmptyChart message="No videos yet. Upload your first video to see performance data!" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { label: "Videos", value: data.video_count || 0 },
              { label: "Views (K)", value: Math.floor((data.total_views || 0) / 1000) },
              { label: "Subs", value: data.subscriber_count || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 12 }} tickFormatter={formatCompactNumber} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [formatCompactNumber(val)]} />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasChannel && hasVideos && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-white font-bold mb-2">Quick Stats</h3>
          <p className="text-gray-400 text-sm">
            Your channel has{" "}
            <span className="text-white font-semibold">{formatNumber(data.video_count)}</span> videos
            with <span className="text-white font-semibold">{formatNumber(data.total_views)}</span> total views
            and <span className="text-white font-semibold">{formatNumber(data.subscriber_count)}</span> subscribers.
            Average views per video:{" "}
            <span className="text-white font-semibold">{formatCompactNumber(avgViewsPerVideo)}</span>.
          </p>
        </div>
      )}
    </div>
  );
}

export default Analytics;