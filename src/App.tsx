import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Navigate ni import qilish esdan chiqmasin
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import { useAuth } from "@/hooks/use-auth"; 
import { GreenhouseProvider } from "@/contexts/GreenhouseContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import GreenhouseViewPage from "./pages/GreenhouseViewPage";
import GreenhouseSettingsPage from "./pages/GreenhouseSettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

// LandingPage endi kerak emas, chunki biz to'g'ridan-to'g'ri o'tib ketamiz

const queryClient = new QueryClient();

// --- PROTECTED ROUTE ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
      {/* --- ASOSIY O'ZGARISH SHU YERDA --- */}
      {/* Kim "/" ga kirsa, avtomatik "/dashboard" ga otib yuboradi */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      
      {/* Dashboard himoyalangan, lekin bizda token borligi uchun kirib ketaveradi */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/greenhouse/:id" element={<ProtectedRoute><GreenhouseViewPage /></ProtectedRoute>} />
      <Route path="/greenhouse/:id/settings" element={<ProtectedRoute><GreenhouseSettingsPage /></ProtectedRoute>} />
      <Route path="/greenhouse/:id/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {

  useEffect(() => {
    // Tokenni tekshirish va o'rnatish logikasi (avvalgi koddan)
    const currentToken = localStorage.getItem('agroai_token'); 
    const universalToken = import.meta.env.VITE_UNIVERSAL_TOKEN;

    if (!currentToken && universalToken) {
      localStorage.setItem('agroai_token', universalToken);
      
      // Fake User
      const fakeUser = {
        id: "universal_guest",
        email: "guest@agroai.uz",
        full_name: "Mehmon Foydalanuvchi",
        role: "user"
      };
      localStorage.setItem('agroai_user', JSON.stringify(fakeUser));
      
      window.location.reload(); 
    }
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