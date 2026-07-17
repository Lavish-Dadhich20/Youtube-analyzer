import { useState } from "react";
import { Mic, MicOff, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useVoiceInput from "../hooks/useVoiceInput";

function TitleGenerator() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("viral");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  const { listening, supported, startListening, stopListening } = useVoiceInput(
    (text) => setTopic(text)
  );

  const styles = [
    { value: "viral", label: "🔥 Viral" },
    { value: "educational", label: "📚 Educational" },
    { value: "clickbait", label: "😮 Curiosity" },
    { value: "listicle", label: "📋 List Format" },
    { value: "how-to", label: "🛠️ How-To" },
    { value: "story", label: "📖 Storytelling" },
  ];

  const generateTitles = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic or speak it.");
      return;
    }

    setLoading(true);
    setError("");
    setTitles([]);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/chat/youtuber", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: `Generate exactly 10 optimized YouTube titles for this topic: "${topic}"
Style: ${style}

Rules:
- Each title on a new line
- Number them 1-10
- Make them SEO-optimized and click-worthy
- Mix different angles (curiosity, benefit, number, question)
- Keep each title under 70 characters
- No explanations, just the 10 titles

Topic: ${topic}`,
          history: [],
        }),
      });

      const data = await res.json();
      const raw = data.response || "";

      const parsed = raw
        .split("\n")
        .filter((line) => line.trim())
        .filter((line) => /^\d+[\.\)]/.test(line.trim()))
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
        .filter((line) => line.length > 5)
        .slice(0, 10);

      if (parsed.length === 0) {
        const fallback = raw
          .split("\n")
          .filter((line) => line.trim().length > 10)
          .slice(0, 10);
        setTitles(fallback);
      } else {
        setTitles(parsed);
      }
    } catch (err) {
      setError("Failed to generate titles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyTitle = (title, index) => {
    navigator.clipboard.writeText(title);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(titles.join("\n"));
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">AI Title Generator</h2>
        <p className="text-gray-400 text-sm">
          Enter a topic and get 10 optimized YouTube titles instantly.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Your Video Topic
          </label>
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateTitles()}
              placeholder="e.g. Python programming for beginners, Budget travel tips..."
              className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
            />
            {supported && (
              <button
                onClick={listening ? stopListening : startListening}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                  listening ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-white"
                }`}
                title={listening ? "Stop" : "Speak topic"}
              >
                {listening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}
          </div>
          {listening && (
            <p className="text-red-500 text-xs mt-2 animate-pulse">
              🎤 Listening... speak your topic now
            </p>
          )}
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-2">Title Style</label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  style === s.value
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={generateTitles}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
        >
          <Sparkles size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating titles..." : "Generate 10 Titles"}
        </button>
      </div>

      <AnimatePresence>
        {titles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">
                Generated Titles
                <span className="text-gray-500 text-sm font-normal ml-2">
                  for "{topic}"
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={generateTitles}
                  className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition"
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
                <button
                  onClick={copyAll}
                  className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  {copied === "all" ? <Check size={12} /> : <Copy size={12} />}
                  {copied === "all" ? "Copied!" : "Copy All"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {titles.map((title, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-red-600 rounded-xl px-4 py-3 group transition"
                >
                  <span className="text-red-500 font-bold text-sm w-5 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-white text-sm flex-1">{title}</p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <span className={`text-xs ${
                      title.length > 60 ? "text-yellow-500" : "text-green-500"
                    }`}>
                      {title.length}/70
                    </span>
                    <button
                      onClick={() => copyTitle(title, i)}
                      className="text-gray-400 hover:text-white transition"
                      title="Copy title"
                    >
                      {copied === i ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h4 className="text-white text-sm font-bold mb-2">💡 Tips for best titles:</h4>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>→ Keep titles under 60 characters for full display in search</li>
                <li>→ Put your main keyword in the first 3 words</li>
                <li>→ Numbers (5, 10, 7) increase CTR by up to 36%</li>
                <li>→ Test 2-3 different titles using YouTube's A/B feature</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TitleGenerator;