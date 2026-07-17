import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-white">
        YT<span className="text-red-600">Analyzer</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-300 hover:text-white transition">
          Home
        </Link>
        <Link to="/analyze" className="text-gray-300 hover:text-white transition">
          Analyze
        </Link>
        <Link to="/trending" className="text-gray-300 hover:text-white transition">
          Trending
        </Link>
        <Link to="/predict" className="text-gray-300 hover:text-white transition">
          Predict
        </Link>

        <Link
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition"
        >
          Login as YouTuber
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;