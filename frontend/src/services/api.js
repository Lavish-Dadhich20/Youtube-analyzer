import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

export const analyzeVideoUrl = async (url) => {
  const response = await api.post("/analyze/url", { url });
  return response.data;
};

export const predictVideoIdea = async (title, description, category) => {
  const response = await api.post("/predict/idea", {
    title,
    description,
    category,
  });
  return response.data;
};

export const getTrendingVideos = async (region = "IN") => {
  const response = await api.get(`/trending/?region=${region}`);
  return response.data;
};

export const sendPublicChatMessage = async (message, history = []) => {
  const response = await api.post("/chat/public", { message, history });
  return response.data;
};

// Backwards-compatible export used by Chatbot.jsx
export const sendChatMessage = async (message, history = []) => {
  return sendPublicChatMessage(message, history);
};

export const registerUser = async (name, email, password, channelUrl = "") => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    channel_url: channelUrl,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getDashboardOverview = async (token) => {
  const response = await api.get("/dashboard/overview", {
    headers: { authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const sendYoutuberChatMessage = async (message, history, token) => {
  const response = await api.post(
    "/chat/youtuber",
    { message, history },
    { headers: { authorization: `Bearer ${token}` } }
  );
  return response.data;
};
export const getDashboardRecommendations = async (token) => {
  const response = await api.get("/dashboard/recommendations", {
    headers: { authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getUserHistory = async (token) => {
  const response = await api.get("/dashboard/history", {
    headers: { authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const compareChannel = async (channel, token) => {
  const response = await api.get(
    `/dashboard/compare-channel?channel=${encodeURIComponent(channel)}`,
    { headers: { authorization: `Bearer ${token}` } }
  );
  return response.data;
};