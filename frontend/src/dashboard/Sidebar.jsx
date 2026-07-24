import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  BarChart2,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
  History,
  Search,
  Zap,
  BarChart,
  Type,
  PlaySquare,
} from "lucide-react";

function Sidebar({ activeSection, setActiveSection, onLogout, collapsed, setCollapsed }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "analyze", label: "Analyze Video", icon: Search },
    { id: "myvideos", label: "My Videos", icon: PlaySquare },
    { id: "predict", label: "Predict Idea", icon: Zap },
    { id: "titles", label: "Title Generator", icon: Type },
    { id: "compare", label: "Compare Channels", icon: BarChart },
    { id: "history", label: "Video History", icon: History },
    { id: "recommendations", label: "AI Recommendations", icon: Lightbulb },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 overflow-hidden ${
          collapsed
            ? "-translate-x-full md:translate-x-0 md:w-16"
            : "translate-x-0 w-64"
        }`}
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
          borderRight: "1px solid rgba(220,38,38,0.15)",
        }}
      >
        {/* Animated glowing left border */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "2px",
            height: "100%",
            background: "linear-gradient(180deg, transparent 0%, #dc2626 30%, #ef4444 50%, #dc2626 70%, transparent 100%)",
            animation: "borderSlide 3s ease-in-out infinite",
            zIndex: 1,
          }}
        />

        {/* Top red glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "200px",
            background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.12) 0%, transparent 70%)",
            animation: "topGlow 4s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800 relative z-10 min-h-[64px]">
          {!collapsed && (
            <>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    animation: "logoPulse 2.5s ease-in-out infinite",
                  }}
                >
                  <span className="text-white text-xs font-black">YT</span>
                </div>
                <span className="font-bold text-white text-sm tracking-wide">
                  YT<span className="text-red-500">Analyzer</span>
                </span>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-400 hover:text-white transition flex-shrink-0"
              >
                <X size={18} />
              </button>
            </>
          )}

          {collapsed && (
            <div className="flex flex-col items-center w-full gap-3">
              <div
                className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center"
                style={{ animation: "logoPulse 2.5s ease-in-out infinite" }}
              >
                <span className="text-white text-xs font-black">YT</span>
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-gray-400 hover:text-white transition"
              >
                <Menu size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (window.innerWidth < 768) setCollapsed(true);
                }}
                title={collapsed ? item.label : ""}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(90deg, rgba(220,38,38,0.9) 0%, rgba(185,28,28,0.8) 100%)",
                        boxShadow:
                          "0 0 20px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
                        animation: "activeGlow 2s ease-in-out infinite",
                      }
                    : {}
                }
              >
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3px",
                      height: "60%",
                      background: "#fff",
                      borderRadius: "0 2px 2px 0",
                      boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                    }}
                  />
                )}
                <Icon
                  size={18}
                  className="flex-shrink-0"
                  style={isActive ? { filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" } : {}}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-gray-800 relative z-10">
          <button
            onClick={onLogout}
            title={collapsed ? "Logout" : ""}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        @keyframes borderSlide {
          0%, 100% { opacity: 0.4; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1); }
        }

        @keyframes topGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes logoPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220,38,38,0.6),
                        0 0 8px rgba(220,38,38,0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(220,38,38,0),
                        0 0 16px rgba(220,38,38,0.6);
          }
        }

        @keyframes activeGlow {
          0%, 100% {
            box-shadow: 0 0 12px rgba(220,38,38,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.1);
          }
          50% {
            box-shadow: 0 0 24px rgba(220,38,38,0.6),
                        inset 0 1px 0 rgba(255,255,255,0.15);
          }
        }
      `}</style>
    </>
  );
}

export default Sidebar;