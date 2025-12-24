import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isTenantAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <p><b>Welcome:</b> {user?.full_name}</p>
      <p><b>Organization:</b> {user?.name}</p>
      <p><b>Plan:</b> {user?.subscription_plan}</p>

      <hr />

      {isTenantAdmin() && (
        <>
          <button onClick={() => navigate("/users")}>
            Manage Users
          </button>

          <br /><br />

          <button onClick={() => navigate("/projects")}>
            Manage Projects
          </button>

          <br /><br />
        </>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
