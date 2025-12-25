import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/api";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isTenantAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("DASHBOARD USER:", user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Tenant Details for Stats
        if (user && user.tenant_id) {
          // We need to fetch tenant details to get the stats field if available, 
          // OR we can just fetch projects and calculate.
          // API 5 returns stats object.
          try {
            const tenantRes = await axios.get(`/tenants/${user.tenant_id}`);
            if (tenantRes.data.success) {
              const s = tenantRes.data.data.stats;
              // Note: API 5 stats might only have totalUsers, totalProjects, totalTasks.
              // We might need to fetch tasks/projects to get detailed status counts if not provided.
              // Let's rely on what we have or fetch projects list.

              // Fetch projects to get recent ones and calculate project stats
              const projectsRes = await axios.get("/projects?limit=5");
              if (projectsRes.data.success) {
                setRecentProjects(projectsRes.data.data.projects);

                // If API 5 didn't give task breakdown, we might just show totals.
                // Let's trust API 5 for totals.
                setStats({
                  totalProjects: s.total_projects || s.totalProjects || 0,
                  totalTasks: s.total_tasks || s.totalTasks || 0,
                  // completion stats not explicitly invalid in API 5 spec, so we'll leave 0 or implement custom logic if needed.
                  // For this MVP, showing totals is safe.
                  totalUsers: s.total_users || s.totalUsers || 0,
                });
              }
            }
          } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            // Fallback or non-fatal error
          }
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        {/* LOGO OR BRANDING COULD GO HERE */}
        <div></div>
        <button onClick={handleLogout} className="btn-secondary">Logout</button>
      </div>

      <div className="welcome-banner">
        <h1>Welcome back, {user?.full_name}</h1>
        <p>
          Organization: <strong>{user?.tenant_name || user?.name || user?.tenant_id}</strong> •
          Plan: <span style={{ textTransform: "capitalize", background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "12px", marginLeft: "5px" }}>{user?.subscription_plan || "Free"}</span>
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>{stats.totalProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>Team Members</h3>
          <p>{stats.totalUsers}</p>
        </div>
      </div>

      <div className="section">
        <div className="page-header">
          <h2>Recent Projects</h2>
          {isTenantAdmin() && (
            <div>
              <button className="btn-secondary" onClick={() => navigate("/projects")} style={{ marginRight: "10px" }}>Manage Projects</button>
              <button className="btn-secondary" onClick={() => navigate("/users")}>Manage Users</button>
            </div>
          )}
        </div>

        {recentProjects.length > 0 ? (
          <div style={{ display: "grid", gap: "15px" }}>
            {recentProjects.map((proj) => (
              <div key={proj.id} style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e5e7eb" }}>
                <div>
                  <strong style={{ fontSize: "1.1rem", display: "block" }}>{proj.name}</strong>
                  <span style={{ fontSize: "0.85rem", color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: "12px" }}>{proj.status}</span>
                </div>
                <button className="btn-sm" onClick={() => navigate(`/projects/${proj.id}`)}>View Dashboard</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "white", borderRadius: "8px" }}>
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
