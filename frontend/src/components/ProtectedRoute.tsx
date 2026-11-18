import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth.ts";

interface ProtectedRouteProps {
  allowedRole?: "user" | "admin";
}

const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Wait until authentication check finishes
  if (loading) {
    return <div>Checking authentication...</div>;
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check user role
  if (allowedRole && user.role !== allowedRole) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
