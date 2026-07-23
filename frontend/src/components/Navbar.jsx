import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/analyze", label: "Analyze" },
    { to: "/trending", label: "Trending" },
    { to: "/predict", label: "Predict" },
  ];

  return (
    <nav className="bg-black border-b border-gray-800 px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-bold text-white"
          onClick={() => setOpen(false)}
        >
          YT<span className="text-red-600">Analyzer</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-300 hover:text-white transition"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/login"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold transition"
          >
            Login as YouTuber
          </Link>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white p-1"
          aria-label="Toggle menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 pb-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white hover:bg-gray-900 transition px-3 py-3 rounded-lg"
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="bg-red-600 hover:bg-red-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition mt-2"
          >
            Login as YouTuber
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;