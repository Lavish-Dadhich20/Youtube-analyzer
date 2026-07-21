import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Trending from "./pages/Trending";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: "easeOut",
};

function AnimatedRoute({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-black">
      {!isDashboard && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><Home /></AnimatedRoute>} />
          <Route path="/analyze" element={<AnimatedRoute><Analyze /></AnimatedRoute>} />
          <Route path="/trending" element={<AnimatedRoute><Trending /></AnimatedRoute>} />
          <Route path="/predict" element={<AnimatedRoute><Predict /></AnimatedRoute>} />
          <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
          <Route path="/dashboard" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
          <Route path="/privacy" element={<AnimatedRoute><PrivacyPolicy /></AnimatedRoute>} />
          <Route path="/terms" element={<AnimatedRoute><TermsOfService /></AnimatedRoute>} />  
          
        </Routes>
      </AnimatePresence>

      {!isDashboard && <Footer />}
      {!isDashboard && <Chatbot />}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;