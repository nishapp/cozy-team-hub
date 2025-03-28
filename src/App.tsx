
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Bits from "./pages/Bits";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Friends from "./pages/Friends";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import Contact from "./pages/Contact";
import CompanySettings from "./pages/CompanySettings";
import NotFound from "./pages/NotFound";

// AnimatePresence wrapper component that provides location to children
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bits" element={<Bits />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/company-settings" element={<CompanySettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  // Use useState to ensure the QueryClient is only created once
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  }));
  
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
