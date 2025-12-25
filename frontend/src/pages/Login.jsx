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
      <h2>Welcome Back</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Organization Subdomain</label>
          <input
            name="tenantSubdomain"
            placeholder="e.g. acme"
            onChange={handleChange}
            required
          />
        </div>

        <button disabled={loading} className="btn-full">
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Signup</Link>
      </p>
    </div>
  );
}

export default Login;
