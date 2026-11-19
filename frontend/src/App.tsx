
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

const LoadingScreen = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        <p className="text-sm font-medium text-gray-600">
          Loading your Helpdesk...
        </p>
      </div>
    </div>
  );
};

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-gray-900">404</h1>

        <h2 className="mt-4 text-xl font-semibold text-gray-800">
          Page not found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <a
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Back to home
        </a>
      </div>
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
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
          element={
            <Navigate
              to={user ? dashboard : "/login"}
              replace
            />
          }
        />

        <Route
          path="/login"
          element={
            user ? <Navigate to={dashboard} replace /> : <Login />
          }
        />

        <Route
          path="/register"
          element={
            user ? <Navigate to={dashboard} replace /> : <Register />
          }
        />

        {/* User routes */}

        <Route element={<ProtectedRoute allowedRole="user" />}>
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/user/tickets/:id"
            element={<TicketDetails />}
          />
        </Route>

        {/* Admin routes */}

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>

        {/* Not found */}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
