import { useState, useRef, useEffect } from "react";
import { Menu, Bell, X, } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import Analytics from "./Analytics";
import Recommendations from "./Recommendations";
import Settings from "./Settings";
import Chatbot from "../components/Chatbot";
import HistoryPage from "./History";
import AnalyzeVideo from "./AnalyzeVideo";
import PredictIdea from "./PredictIdea";
import TitleGenerator from "./TitleGenerator";
import Compare from "./Compare";
import MyVideos from "./MyVideos";
import FeedbackModal from "../components/FeedbackModal";
import ParticleBackground from "../components/ParticleBackground";

const NOTIFICATIONS = [
  { id: 1, text: "AI analysis complete for your last video", time: "2m ago", unread: true },
  { id: 2, text: "New trending topic in your niche detected", time: "1h ago", unread: true },
  { id: 3, text: "Weekly channel report is ready", time: "1d ago", unread: false },
];

function DashboardLayout({ data, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  // Start collapsed on mobile so the sidebar doesn't cover the dashboard on first load
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [showFeedback, setShowFeedback] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleLogoutClick = () => {
    setShowFeedback(true);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <Overview data={data} />;
      case "analytics": return <Analytics data={data} />;
      case "analyze": return <AnalyzeVideo data={data} />;
      case "predict": return <PredictIdea />;
      case "titles": return <TitleGenerator />;
      case "compare": return <Compare data={data} />;
      case "myvideos": return <MyVideos data={data} />;
      case "history": return <HistoryPage setActiveSection={setActiveSection} />;
      case "recommendations": return <Recommendations data={data} />;
      case "settings": return <Settings data={data} onLogout={handleLogoutClick} />;
      default: return <Overview data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-x-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogoutClick}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${
        collapsed ? "md:ml-16" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 bg-black border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="md:hidden text-gray-400 hover:text-white transition flex-shrink-0"
            >
              <Menu size={22} />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-gray-400 hover:text-white transition relative p-1.5"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-[200]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                      <h4 className="text-white font-bold text-sm">Notifications</h4>
                      <button
                        onClick={markAllRead}
                        className="text-red-500 hover:text-red-400 text-xs font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-gray-800 last:border-0 ${
                            n.unread ? "bg-gray-800" : ""
                          }`}
                        >
                          <p className="text-white text-sm">{n.text}</p>
                          <p className="text-gray-500 text-xs mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {data.user?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto overflow-x-hidden relative">
          <ParticleBackground count={25} color="100, 100, 100" contained={true} />
          <div className="relative z-10 min-w-0">
            {renderSection()}
          </div>
        </main>
      </div>

      <Chatbot />

      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

export default DashboardLayout;