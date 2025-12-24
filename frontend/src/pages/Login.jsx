import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    tenantSubdomain: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // 1️⃣ LOGIN
      const loginRes = await api.post("/auth/login", form);
      const token = loginRes.data.data.token;

      // 2️⃣ FETCH FULL USER (TENANT + PLAN)
      const meRes = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 3️⃣ SET CONTEXT
      login(token, meRes.data.data);

      // 4️⃣ NAVIGATE
      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />

        <input
          name="tenantSubdomain"
          placeholder="Tenant Subdomain"
          onChange={handleChange}
          required
        />

        <button disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        New tenant? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default Login;
