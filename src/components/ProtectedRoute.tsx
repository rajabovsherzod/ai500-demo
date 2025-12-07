import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Agar token bo'lmasa, Login sahifasiga haydaymiz
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Agar token bo'lsa, ichki sahifalarni (Dashboard) ko'rsatamiz
  return <Outlet />;
};

export default ProtectedRoute;