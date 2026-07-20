import { useState } from "react";
import { Star, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BACKEND_URL from "../services/config";

function FeedbackModal({ onClose, onLogout }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "General Feedback",
    "Bug Report",
    "Feature Request",
    "UI/UX Suggestion",
    "AI Quality",
    "Performance Issue",
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BACKEND_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          category,
          comment,
        }),
      });
      setSubmitted(true);
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err) {
      onLogout();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    onLogout();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-80 z-[200] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md relative"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
          >
            <X size={20} />
          </button>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                Thank you for your feedback!
              </h3>
              <p className="text-gray-400 text-sm">
                Your input helps us improve YTAnalyzer.
              </p>
              <p className="text-gray-500 text-xs mt-2">Logging you out...</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-white font-bold text-xl mb-1">
                  Before you go... 👋
                </h3>
                <p className="text-gray-400 text-sm">
                  Help us improve YTAnalyzer with a quick rating!
                </p>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-3">
                  How would you rate your experience?
                </p>
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        size={36}
                        className={`transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm mt-2 text-gray-400">
                    {rating === 1 && "😞 Poor"}
                    {rating === 2 && "😐 Fair"}
                    {rating === 3 && "🙂 Good"}
                    {rating === 4 && "😊 Very Good"}
                    {rating === 5 && "🤩 Excellent!"}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        category === cat
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">
                  Comments or suggestions{" "}
                  <span className="text-gray-600">(optional)</span>
                </p>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved or what we can improve..."
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-red-600 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white py-2.5 rounded-lg text-sm font-semibold transition"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  {submitting ? "Sending..." : "Submit & Logout"}
                </button>
              </div>

              <p className="text-gray-600 text-xs text-center mt-3">
                Your feedback is anonymous and helps us improve
              </p>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default FeedbackModal;