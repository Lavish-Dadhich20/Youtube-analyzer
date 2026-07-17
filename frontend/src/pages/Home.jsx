import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TrendingUp, Sparkles, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getTrendingVideos } from "../services/api";
import { formatCompactNumber } from "../services/format";
import { TrendingCardSkeleton } from "../components/Skeleton";
import ParticleBackground from "../components/ParticleBackground";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

function Home() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const [previewVideos, setPreviewVideos] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await getTrendingVideos("IN");
        setPreviewVideos((data.videos || []).slice(0, 3));
      } catch (err) {
        setPreviewVideos([]);
      } finally {
        setPreviewLoading(false);
      }
    };

    fetchPreview();
  }, []);

  const handleQuickAnalyze = () => {
    if (!url) return;
    const isUrl = url.includes("youtube.com") || url.includes("youtu.be");
    if (isUrl) {
      navigate(`/analyze?url=${encodeURIComponent(url)}`);
    } else {
      navigate(`/predict?idea=${encodeURIComponent(url)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleQuickAnalyze();
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <ParticleBackground count={80} color="255, 50, 50" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 sm:pt-24 pb-16 text-center">

        <motion.p
          className="text-red-500 font-semibold tracking-widest text-sm mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI-POWERED YOUTUBE ANALYSIS
        </motion.p>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Know if your video
          <br />
          will <span className="text-red-600">hit or flop</span> — before you upload.
        </motion.h1>

        <motion.p
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Paste a YouTube link or describe your next video idea. Our AI predicts
          views, scores your title, and tells you exactly why a channel grows
          or stalls.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a YouTube URL or describe your video idea..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
          />
          <button
            onClick={handleQuickAnalyze}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap"
          >
            Get Verdict
          </button>
        </motion.div>

        <motion.p
          className="text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Paste a URL to analyze · Describe an idea to predict
        </motion.p>
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600 transition"
          >
            <TrendingUp className="text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">Trend Verdict</h3>
            <p className="text-gray-400 text-sm">
              See if your topic is trending right now, with a clear score —
              not vague guesses.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600 transition"
          >
            <Sparkles className="text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">AI Performance Score</h3>
            <p className="text-gray-400 text-sm">
              Get an honest score out of 100, plus the exact strengths and
              fixes behind it.
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-red-600 transition"
          >
            <MessageCircle className="text-red-600 mb-4" size={32} />
            <h3 className="text-lg font-bold mb-2">Why Channels Grow</h3>
            <p className="text-gray-400 text-sm">
              Login as a YouTuber to get the "why" behind your growth — not
              just the numbers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trending Preview */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold">Trending right now</h2>
          <Link
            to="/trending"
            className="text-red-500 hover:text-red-400 text-sm font-semibold"
          >
            See all →
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6">
          {previewLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TrendingCardSkeleton key={i} />
            ))}

          {!previewLoading &&
            previewVideos.map((video, i) => (
              <motion.a
                key={video.video_id}
                href={"https://www.youtube.com/watch?v=" + video.video_id}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-600 transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
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
                  <p className="text-gray-500 text-xs">
                    {formatCompactNumber(video.views)} views
                  </p>
                </div>
              </motion.a>
            ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 grid sm:grid-cols-3 gap-8 text-center"
        >
          <div>
            <p className="text-4xl font-extrabold text-red-600 mb-1">10K+</p>
            <p className="text-gray-400 text-sm">Videos Analyzed</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-red-600 mb-1">95%</p>
            <p className="text-gray-400 text-sm">Prediction Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-red-600 mb-1">3</p>
            <p className="text-gray-400 text-sm">AI Models Working Together</p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-red-950 to-gray-900 border border-red-900 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-extrabold mb-4">
            Ready to grow your channel?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join creators who use AI to make smarter content decisions —
            before they hit record.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/analyze"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Try Analyzer →
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

export default Home;