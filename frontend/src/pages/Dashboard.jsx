import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <p>Welcome, {user.full_name}</p>
      <p>Role: {user.role}</p>

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}
