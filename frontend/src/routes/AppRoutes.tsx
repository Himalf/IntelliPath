import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ProtectedRoute from "../components/ProtectedRoutes";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../features/auth/AuthContext";
import LandingPage from "../pages/LandingPage";
import UserManagementTable from "../features/user-management/UserManagement";
import ResumePage from "@/pages/User/ResumePage";
import CareerSuggestionsPage from "@/pages/User/career-suggestions";
import CourseManagementPage from "@/pages/admin/CourseManagementPage";
import ChatInterface from "@/components/ChatInterface";
import FeedbackPage from "@/pages/User/feedback";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import UserDashboardPage from "@/pages/User/UserDashboardPage";

export default function AppRoutes() {
  const { token, user } = useAuth();

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
        <Route path="user-management" element={<UserManagementTable />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="career" element={<CareerSuggestionsPage />} />
        <Route path="course" element={<CourseManagementPage />} />
        <Route path="assistant" element={<ChatInterface />} />
        <Route path="feedback" element={<FeedbackPage />} />
        {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
          <Route path="" element={<AdminDashboardPage />} />
        )}
        {(user?.role === "USER" || user?.role === "EXPERT") && (
          <Route path="" element={<UserDashboardPage />} />
        )}
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
    </Routes>
  );
}
