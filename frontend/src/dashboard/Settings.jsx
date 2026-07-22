import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Video, Moon, Sun, Bell, Shield, Trash2, Tv } from "lucide-react";
import BACKEND_URL from "../services/config";

function Settings({ data, onLogout }) {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/auth/delete-account`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("theme");
      document.documentElement.classList.remove("light-theme");
      navigate("/login");
    } catch (err) {
      alert("Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-gray-400 text-sm">Manage your account and preferences.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-red-500" />
          <h3 className="text-white font-bold">Account</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div>
              <p className="text-white text-sm font-medium">Name</p>
              <p className="text-gray-400 text-sm">{data.user}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div>
              <p className="text-white text-sm font-medium">Email</p>
              <p className="text-gray-400 text-sm">{data.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-800">
            <div>
              <p className="text-white text-sm font-medium">Plan</p>
              <p className="text-gray-400 text-sm capitalize">{data.plan} — Free tier</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
              Upgrade
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-white text-sm font-medium">Member Since</p>
              <p className="text-gray-400 text-sm">
                {new Date(data.member_since).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tv size={18} className="text-red-500" />
          <h3 className="text-white font-bold">YouTube Channel</h3>
        </div>
        {data.verified ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-800">
              <div>
                <p className="text-white text-sm font-medium">Channel</p>
                <p className="text-green-500 text-sm">✓ {data.channel_name} — Verified</p>
              </div>
              <a
                href={data.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-400 text-xs font-semibold"
              >
                View →
              </a>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-white text-sm font-medium">Switch Channel</p>
                <p className="text-gray-400 text-sm">Connect a different YouTube account</p>
              </div>
              <a
                href={`${BACKEND_URL}/auth/youtube/login`}
                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Switch
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">No channel connected</p>
              <p className="text-gray-400 text-sm">Verify ownership of your YouTube channel</p>
            </div>
            <a
              href={`${BACKEND_URL}/auth/youtube/login`}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Connect
            </a>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Moon size={18} className="text-red-500" />
          <h3 className="text-white font-bold">Appearance</h3>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white text-sm font-medium">Theme</p>
            <p className="text-gray-400 text-sm">Choose your preferred color scheme</p>
          </div>
          <div className="flex bg-gray-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => handleThemeChange("dark")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                theme === "dark" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Moon size={12} /> Dark
            </button>
            <button
              onClick={() => handleThemeChange("light")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                theme === "light" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              <Sun size={12} /> Light
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-red-500" />
          <h3 className="text-white font-bold">Notifications</h3>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-white text-sm font-medium">AI Insights Alerts</p>
            <p className="text-gray-400 text-sm">
              Get notified when new recommendations are ready
            </p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${
              notifications ? "bg-red-600" : "bg-gray-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                notifications ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-red-900 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-red-500" />
          <h3 className="text-white font-bold">Danger Zone</h3>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-800 mb-3">
          <div>
            <p className="text-white text-sm font-medium">Logout</p>
            <p className="text-gray-400 text-sm">Sign out of your account</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div className="flex-1 mr-4">
            <p className="text-red-400 text-sm font-medium">Delete Account</p>
            <p className="text-gray-400 text-sm">
              {deleteConfirm
                ? "⚠️ Are you sure? This cannot be undone. Click Confirm to proceed."
                : "Permanently delete your account and all your data"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {deleteConfirm && (
              <button
                onClick={() => setDeleteConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 flex-shrink-0 ${
                deleteConfirm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-red-900 hover:bg-red-800 text-red-300"
              }`}
            >
              <Trash2 size={12} />
              {deleting ? "Deleting..." : deleteConfirm ? "Confirm" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;