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

  if (loading) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="dashboard-container" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Dashboard</h2>
        <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ marginBottom: "20px", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
        <p><b>Welcome, {user?.full_name}</b></p>
        <p>Organization: {user?.tenant_id} (Plan: {user?.role})</p>
      </div>

      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div className="stat-card" style={{ padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "8px", background: "white" }}>
          <h3>Total Projects</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.totalProjects}</p>
        </div>
        <div className="stat-card" style={{ padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "8px", background: "white" }}>
          <h3>Total Tasks</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.totalTasks}</p>
        </div>
        <div className="stat-card" style={{ padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderRadius: "8px", background: "white" }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.totalUsers}</p>
        </div>
      </div>

      <div className="recent-projects">
        <h3>Recent Projects</h3>
        {recentProjects.length > 0 ? (
          <div style={{ display: "grid", gap: "10px" }}>
            {recentProjects.map((proj) => (
              <div key={proj.id} style={{ padding: "15px", border: "1px solid #eee", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{proj.name}</strong>
                  <span style={{ marginLeft: "10px", padding: "2px 8px", borderRadius: "12px", background: "#e3f2fd", fontSize: "0.8em" }}>{proj.status}</span>
                </div>
                <button onClick={() => navigate(`/projects/${proj.id}`)} style={{ padding: "5px 10px", cursor: "pointer" }}>View</button>
              </div>
            ))}
          </div>
        ) : (
          <p>No projects found.</p>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        {isTenantAdmin() && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => navigate("/users")} style={{ padding: "10px 20px", cursor: "pointer" }}>Manage Users</button>
            <button onClick={() => navigate("/projects")} style={{ padding: "10px 20px", cursor: "pointer" }}>Manage Projects</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
