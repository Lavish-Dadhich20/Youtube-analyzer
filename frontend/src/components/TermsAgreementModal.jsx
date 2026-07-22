import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

function TermsAgreementModal({ onAgree, onDecline }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[300] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Welcome to YTAnalyzer!</h3>
            <p className="text-gray-400 text-xs">Please review our terms before continuing</p>
          </div>
        </div>

        <div className="bg-black border border-gray-800 rounded-xl p-4 mb-5 text-sm text-gray-400 space-y-2">
          <p>By using YTAnalyzer, you agree that:</p>
          <ul className="space-y-1.5 mt-2">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">→</span>
              <span>We collect your email and YouTube channel data (read-only)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">→</span>
              <span>We never post, delete or modify your YouTube content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">→</span>
              <span>We never sell your data to third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">→</span>
              <span>You can delete your account anytime from Settings</span>
            </li>
          </ul>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <input
            type="checkbox"
            id="oauth-agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 accent-red-600 cursor-pointer flex-shrink-0"
          />
          <label htmlFor="oauth-agree" className="text-gray-400 text-sm cursor-pointer">
            I agree to the{" "}
            <Link
              to="/terms"
              target="_blank"
              className="text-red-500 hover:text-red-400 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              target="_blank"
              className="text-red-500 hover:text-red-400 underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Decline & Logout
          </button>
          <button
            onClick={onAgree}
            disabled={!agreed}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Agree & Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default TermsAgreementModal;