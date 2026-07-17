import { Link } from "react-router-dom";
import { Heart, ExternalLink } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 text-gray-400">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">YT</span>
              </div>
              <span className="text-white font-bold text-lg">
                YT<span className="text-red-600">Analyzer</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              AI-powered YouTube analytics. Know if your video will hit or flop
              before you upload.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Lavish-Dadhich20"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/lavish-dadhich"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-900 hover:bg-blue-900 border border-gray-800 hover:border-blue-700 text-gray-400 hover:text-blue-400 px-3 py-2 rounded-lg text-xs font-semibold transition"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/analyze" className="hover:text-white transition">
                  Video Analyzer
                </Link>
              </li>
              <li>
                <Link to="/predict" className="hover:text-white transition">
                  Idea Predictor
                </Link>
              </li>
              <li>
                <Link to="/trending" className="hover:text-white transition">
                  Trending Videos
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Register
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:8000/auth/youtube/login"
                  className="hover:text-white transition"
                >
                  Connect YouTube
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Tech Stack</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                <span className="text-gray-500">FastAPI + Python</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-gray-500">React + Vite + Tailwind</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                <span className="text-gray-500">Groq + Gemini + Ollama</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full flex-shrink-0" />
                <span className="text-gray-500">MongoDB Atlas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                <span className="text-gray-500">YouTube Data API v3</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026 YTAnalyzer. Built by{" "}
            <a
              href="https://www.linkedin.com/in/lavish-dadhich"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition"
            >
              Lavish Dadhich
            </a>
          </p>


          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>v1.0.0</span>
            <span>•</span>
            <a
              href="https://github.com/Lavish-Dadhich20"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition"
            >
              <ExternalLink size={12} />
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;