import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, padding: 20, background: "#f4f4f4" }}>
        <h3>Menu</h3>
        <nav
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <NavLink to="career">Career Suggestions</NavLink>
          <NavLink to="resume">Resume Analysis</NavLink>
          <NavLink to="chatbot">Chatbot</NavLink>
          <NavLink to="courses">Courses</NavLink>
          <NavLink to="feedback">Feedback</NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
