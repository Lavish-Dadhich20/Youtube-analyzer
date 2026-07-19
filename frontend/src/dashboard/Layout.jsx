import { useState, useRef, useEffect } from "react";
import { Menu, Bell, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Overview from "./Overview";
import Analytics from "./Analytics";
import Recommendations from "./Recommendations";
import Settings from "./Settings";
import Chatbot from "../components/Chatbot";
import HistoryPage from "./History";
import AnalyzeVideo from "./AnalyzeVideo";
import PredictIdea from "./PredictIdea";
import Compare from "./Compare";
import TitleGenerator from "./TitleGenerator";
import ParticleBackground from "../components/ParticleBackground";

const NOTIFICATIONS = [
  { id: 1, text: "AI analysis complete for your last video", time: "2m ago", unread: true },
  { id: 2, text: "New trending topic in your niche detected", time: "1h ago", unread: true },
  { id: 3, text: "Weekly channel report is ready", time: "1d ago", unread: false },
];

function DashboardLayout({ data, onLogout }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
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

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <Overview data={data} />;
      case "analytics": return <Analytics data={data} />;
      case "analyze": return <AnalyzeVideo data={data} />;
      case "predict": return <PredictIdea />;
      case "titles": return <TitleGenerator />;
      case "compare": return <Compare data={data} />;    
      case "history": return <HistoryPage setActiveSection={setActiveSection} />;
      case "recommendations": return <Recommendations data={data} />;
      case "settings": return <Settings data={data} onLogout={onLogout} />;
      default: return <Overview data={data} />;
    }
  };
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        collapsed ? "md:ml-16" : "md:ml-64"
      }`}>
        <header className="sticky top-0 z-40 bg-black border-b border-gray-800 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="md:hidden text-gray-400 hover:text-white transition flex-shrink-0"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search dashboard..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-4 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto flex-shrink-0" ref={notifRef}>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-gray-400 hover:text-white transition relative p-1"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-10 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-[100]">
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
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8 overflow-y-auto relative">
          <ParticleBackground count={30} color="150, 150, 150" />
          <div className="relative z-10">
            {renderSection()}
          </div>
        </main>
      </div>

      <Chatbot />
    </div>
  );
}

export default DashboardLayout;