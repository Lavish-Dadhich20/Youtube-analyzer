import { useState, useEffect } from "react";
import { ArrowLeft, Eye, ThumbsUp, MessageCircle, Loader2, Search, X } from "lucide-react";
import BACKEND_URL from "../services/config";

function MyVideos({ data }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(""); // the query actually being searched
  const [searching, setSearching] = useState(false);

  const token = localStorage.getItem("token");
  const isSearchMode = activeQuery.trim().length > 0;

  const fetchVideos = async (pageToken = null) => {
    try {
      const url = new URL(`${BACKEND_URL}/dashboard/videos`);
      if (pageToken) url.searchParams.set("page_token", pageToken);

      const res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to load videos");
      }

      const result = await res.json();
      setVideos((prev) => (pageToken ? [...prev, ...result.videos] : result.videos));
      setNextPageToken(result.next_page_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  };

  const fetchSearch = async (searchQuery, pageToken = null) => {
    try {
      const url = new URL(`${BACKEND_URL}/dashboard/videos/search`);
      url.searchParams.set("q", searchQuery);
      if (pageToken) url.searchParams.set("page_token", pageToken);

      const res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Search failed");
      }

      const result = await res.json();
      setVideos((prev) => (pageToken ? [...prev, ...result.videos] : result.videos));
      setNextPageToken(result.next_page_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    if (data.verified) {
      fetchVideos();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    setError("");

    if (!trimmed) {
      // Empty search = go back to normal list
      clearSearch();
      return;
    }

    setActiveQuery(trimmed);
    setSearching(true);
    setLoading(true);
    setVideos([]);
    setNextPageToken(null);
    fetchSearch(trimmed);
  };

  const clearSearch = () => {
    setQuery("");
    setActiveQuery("");
    setError("");
    setLoading(true);
    setVideos([]);
    setNextPageToken(null);
    fetchVideos();
  };

  const loadMore = () => {
    setLoadingMore(true);
    if (isSearchMode) {
      fetchSearch(activeQuery, nextPageToken);
    } else {
      fetchVideos(nextPageToken);
    }
  };

  const openVideo = async (id) => {
    setError("");
    setDetailLoading(true);
    setSelected({ id });
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard/videos/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to load video details");
      }
      const result = await res.json();
      setSelected(result);
    } catch (err) {
      setError(err.message);
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  if (!data.verified) {
    return (
      <div className="bg-gray-900 border border-yellow-600 border-dashed rounded-xl p-8 text-center">
        <p className="text-white font-bold mb-2">Connect your YouTube channel</p>
        <p className="text-gray-400 text-sm">
          Connect your channel from Settings to see your videos and per-video analytics here.
        </p>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-6 min-w-0">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm"
        >
          <ArrowLeft size={16} /> Back to videos
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {detailLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-red-500" size={28} />
          </div>
        ) : (
          selected.title && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5 min-w-0">
              <img
                src={selected.thumbnail}
                alt={selected.title}
                className="w-full max-w-md rounded-lg mx-auto"
              />
              <h2 className="text-xl font-bold text-white break-words">{selected.title}</h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black border border-gray-800 rounded-lg p-3 text-center min-w-0">
                  <Eye size={16} className="text-red-500 mx-auto mb-1" />
                  <p className="text-white font-bold truncate">{selected.views?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Views</p>
                </div>
                <div className="bg-black border border-gray-800 rounded-lg p-3 text-center min-w-0">
                  <ThumbsUp size={16} className="text-red-500 mx-auto mb-1" />
                  <p className="text-white font-bold truncate">{selected.likes?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Likes</p>
                </div>
                <div className="bg-black border border-gray-800 rounded-lg p-3 text-center min-w-0">
                  <MessageCircle size={16} className="text-red-500 mx-auto mb-1" />
                  <p className="text-white font-bold truncate">{selected.comments?.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs">Comments</p>
                </div>
              </div>

              <div className="bg-black border border-gray-800 rounded-lg p-4">
                <p className="text-gray-400 text-xs mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-red-500">{selected.engagement_rate}%</p>
              </div>

              <div className="bg-black border border-gray-800 rounded-lg p-4">
                <p className="text-white font-bold mb-2">Insight</p>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.insight}</p>
              </div>

              <p className="text-gray-600 text-xs">
                Published {new Date(selected.published_at).toLocaleDateString()}
              </p>
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">My Videos</h2>
        <p className="text-gray-400 text-sm">Search or click any video to see its detailed analytics.</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your videos by title..."
          className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-16 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition p-1"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {isSearchMode && !loading && (
        <p className="text-gray-500 text-xs">
          Showing results for "<span className="text-gray-300">{activeQuery}</span>"
        </p>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-red-500" size={28} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <button
                key={v.id}
                onClick={() => openVideo(v.id)}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden text-left hover:border-red-600 transition min-w-0"
              >
                <img src={v.thumbnail} alt={v.title} className="w-full aspect-video object-cover" />
                <div className="p-3 min-w-0">
                  <p className="text-white text-sm font-semibold line-clamp-2 mb-2 break-words">
                    {v.title}
                  </p>
                  <div className="flex items-center gap-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {v.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} /> {v.likes.toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {videos.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">
              {isSearchMode
                ? `No videos found matching "${activeQuery}".`
                : "No videos found on this channel yet."}
            </p>
          )}

          {nextPageToken && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyVideos;