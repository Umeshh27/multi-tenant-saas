import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

function Dashboard() {
  const { user, logout, isTenantAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => {
        setStats(res.data.data);
      })
      .catch((err) => {
        // ✅ logout ONLY if token is invalid
        if (err.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
        }
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, []);

  // ✅ WAIT FOR AUTH FIRST
  if (!user) {
    return <p>Loading user...</p>;
  }

  // ✅ WAIT FOR STATS SEPARATELY
  if (loadingStats) {
    return <p>Loading dashboard...</p>;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <p>
        Welcome <b>{user.full_name}</b>
      </p>

      <p>
        Organization: <b>{stats?.tenantName}</b>
      </p>

      <p>
        Plan: <b>{stats?.plan}</b>
      </p>

      <p>
        Users: {stats?.totalUsers} / {stats?.maxUsers}
      </p>

      <p>
        Projects: {stats?.totalProjects} / {stats?.maxProjects}
      </p>

      {isTenantAdmin() && (
        <div className="admin-actions">
          <button>Manage Users</button>
          <button>Manage Projects</button>
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
