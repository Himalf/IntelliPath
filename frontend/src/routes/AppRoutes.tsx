// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ProtectedRoute from "../components/ProtectedRoutes";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../features/auth/AuthContext";
import LandingPage from "../pages/LandingPage"; // 👈 import your landing page

export default function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Root route shows landing if not logged in */}
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <LandingPage />}
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
        {/* Nested routes inside dashboard can go here */}
        {/* <Route path="career" element={<CareerSuggestions />} /> */}
        {/* <Route path="resume" element={<ResumeAnalysis />} /> */}
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
    </Routes>
  );
}
