import { useState, useEffect } from "react";
import { getTrendingVideos } from "../services/api";
import { formatNumber, formatCompactNumber } from "../services/format";
import { TrendingCardSkeleton } from "../components/Skeleton";
import ParticleBackground from "../components/ParticleBackground";

function Trending() {
  const [videos, setVideos] = useState([]);
  const [region, setRegion] = useState("IN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const regions = [
    { code: "ALL", name: "All Regions" },
    { code: "IN", name: "India" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "CA", name: "Canada" },
    { code: "JP", name: "Japan" },
    { code: "DE", name: "Germany" },
    { code: "BR", name: "Brazil" },
    { code: "KR", name: "South Korea" },
  ];

  useEffect(() => {
    // regions is a stable constant in this component; include it to satisfy lint rules.
    const fetchTrending = async () => {
      setLoading(true);
      setError("");
      try {
        if (region === "ALL") {
          const allRegionCodes = regions
            .filter((r) => r.code !== "ALL")
            .map((r) => r.code);

          const results = await Promise.all(
            allRegionCodes.map((code) => getTrendingVideos(code))
          );

          const combined = results.flatMap((r) => r.videos || []);

          const unique = Array.from(
            new Map(combined.map((v) => [v.video_id, v])).values()
          );

          setVideos(unique);
        } else {
          const data = await getTrendingVideos(region);
          setVideos(data.videos || []);
        }
      } catch { 
        setError("Failed to load trending videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [region]);

  return (
    <div className="min-h-screen text-white px-6 py-12 max-w-6xl mx-auto relative">
      <ParticleBackground count={30} color="120, 120, 120" />
      <div className="relative z-10">
      <h1 className="text-4xl font-bold mb-2">Trending Now</h1>
      <p className="text-gray-400 mb-8">
        See what's currently trending on YouTube, by country.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r.code}
              onClick={() => setRegion(r.code)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                region === r.code
                  ? "bg-red-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-gray-400 text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-600"
          >
            <option value="default">Default</option>
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrendingCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...videos]
            .sort((a, b) => {
              if (sortBy === "views") return b.views - a.views;
              if (sortBy === "likes") return b.likes - a.likes;
              return 0;
            })
            .map((video) => (
              <a
                key={video.video_id}
                href={"https://www.youtube.com/watch?v=" + (video.video_id ?? "")}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600 transition"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{video.channel}</p>
                  <div
                    className="flex items-center gap-3 text-gray-500 text-xs"
                    title={`${formatNumber(video.views)} views • ${formatNumber(
                      video.likes
                    )} likes`}
                  >
                    <span>{formatCompactNumber(video.views)} views</span>
                    <span>•</span>
                    <span>{formatCompactNumber(video.likes)} likes</span>
                  </div>
                </div>
              </a>
            ))}
        </div>
      )}
    </div>
    </div>
  );
}

export default Trending;