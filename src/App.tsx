
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/layout/Navbar";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bits from "./pages/Bits";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Friends from "./pages/Friends";
import FriendBits from "./pages/FriendBits";
import Profile from "./pages/Profile"; 
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import CompanySettings from "./pages/CompanySettings";
import NotFound from "./pages/NotFound";
import Bookmarks from "./pages/Bookmarks";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Layout component that includes Navbar
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </>
  );
};

// AnimatePresence wrapper component that provides location to children
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout><Index /></Layout>} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/bits" element={<Layout><Bits /></Layout>} />
        <Route path="/posts" element={<Layout><Posts /></Layout>} />
        <Route path="/post/:postId" element={<Layout><PostDetail /></Layout>} />
        <Route path="/friends" element={<Layout><Friends /></Layout>} />
        <Route path="/friends/:friendId/bits" element={<Layout><FriendBits /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/bookmarks" element={<Layout><Bookmarks /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/company-settings" element={<Layout><CompanySettings /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AnimatePresence>
  );
};

// Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner position="bottom-right" />
          <BrowserRouter>
            <AuthProvider>
              <AnimatedRoutes />
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
