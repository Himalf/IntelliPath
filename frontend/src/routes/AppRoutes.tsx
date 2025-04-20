// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ProtectedRoute from "../components/ProtectedRoutes";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../features/auth/AuthContext";

export default function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Redirect from root based on authentication status */}
      <Route
        path="/"
        element={
          token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
        }
      />

      {/* Public routes */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard nested routes can be defined here if needed */}
        {/* These will be rendered in the <Outlet /> of DashboardLayout */}
        {/* <Route path="career" element={<CareerSuggestions />} /> */}
        {/* <Route path="resume" element={<ResumeAnalysis />} /> */}
        {/* etc. */}
      </Route>

      {/* Catch-all route */}
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}
