import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/useAuth.ts";
import ProtectedRoute from "./components/ProtectedRoutes.tsx";


import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import UserDashboard from "./pages/user/UserDashboard.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import TicketDetails from "./pages/user/TicketDetails.tsx";

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading application...</div>;
  }

  const dashboard =
    user?.role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={<Navigate to={user ? dashboard : "/login"} replace />}
        />

        <Route
          path="/login"
          element={user ? <Navigate to={dashboard} replace /> : <Login />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to={dashboard} replace /> : <Register />}
        />

        {/* User routes */}
        <Route element={<ProtectedRoute allowedRole="user" />}>
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />
        </Route>

        <Route path="/user/tickets/:id" element={<TicketDetails />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Not found */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
