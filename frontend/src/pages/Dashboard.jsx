import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDashboardOverview } from "../services/api";
import DashboardLayout from "../dashboard/Layout";
import TermsAgreementModal from "../components/TermsAgreementModal";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    let token = localStorage.getItem("token");
    const urlToken = searchParams.get("token");
    const urlName = searchParams.get("name");
    const oauthError = searchParams.get("oauth_error");

    if (oauthError) {
      setError("OAuth failed. Please try again.");
      setLoading(false);
      return;
    }

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      if (urlName) localStorage.setItem("name", urlName);
      token = urlToken;
      window.history.replaceState({}, "", "/dashboard");
    }

    if (!token) {
      navigate("/login");
      return;
    }
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      if (urlName) localStorage.setItem("name", urlName);
      token = urlToken;
      window.history.replaceState({}, "", "/dashboard");
    }

    const fetchOverview = async () => {
      try {
        const result = await getDashboardOverview(token);
        setData(result);

        // Check if terms agreed in MongoDB
        const agreedInDB = result.terms_agreed === true;
        const agreedLocally = localStorage.getItem("terms_agreed") === "true";
        if (!agreedInDB && !agreedLocally) {
          setShowTerms(true);
        }
      } catch (err) {
        setError("Failed to load dashboard. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("name");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [navigate, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-4">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" />
          </div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return <DashboardLayout data={data} onLogout={handleLogout} />;
  {showTerms && (
        <TermsAgreementModal
          onAgree={() => {
            localStorage.setItem("terms_agreed", "true");
            setShowTerms(false);
          }}
          onDecline={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            navigate("/login");
          }}
        />
      )}
}

export default Dashboard;