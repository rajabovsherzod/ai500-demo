import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { GreenhouseProvider } from "@/contexts/GreenhouseContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer"; 

import ChatWidget from "@/components/ChatWidget"; 

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import GreenhouseViewPage from "./pages/GreenhouseViewPage";
import GreenhouseSettingsPage from "./pages/GreenhouseSettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
// YANGI: Import
import AiAnalysisPage from "./pages/AiAnalysisPage"; 
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { whoAmI } from "./api/auth.api";

const queryClient = new QueryClient();

// --- PROTECTED LAYOUT ---
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

// --- PUBLIC ROUTE ---
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* YANGI ROUTE: */}
        <Route path="/analyze" element={<AiAnalysisPage />} /> 
        
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/greenhouse/:id" element={<GreenhouseViewPage />} />
        <Route path="/greenhouse/:id/settings" element={<GreenhouseSettingsPage />} />
        <Route path="/greenhouse/:id/analytics" element={<AnalyticsPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // ... (Auth logic avvalgidek qoladi) ...
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = localStorage.getItem("agroai_token");
      const universalToken = import.meta.env.VITE_UNIVERSAL_TOKEN;

      if (!currentToken && universalToken) {
        localStorage.setItem("agroai_token", universalToken);
      }

      const token = localStorage.getItem("agroai_token");
      if (!token) return;

      try {
        const user = await whoAmI();
        localStorage.setItem("agroai_user", JSON.stringify(user));

        if (window.location.pathname === "/" || window.location.pathname === "/login") {
          window.location.href = "/dashboard";
        }
      } catch (error) {
        localStorage.removeItem("agroai_token");
        localStorage.removeItem("agroai_user");
      }
    };

    void initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GreenhouseProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          
        </TooltipProvider>
      </GreenhouseProvider>
    </QueryClientProvider>
  );
};

export default App;