import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import '../App.css';

function Login() {
  const navigate = useNavigate();
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
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.data.token);

      navigate("/dashboard");
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
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <br />

        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <br />

        <input name="tenantSubdomain" placeholder="Tenant Subdomain" onChange={handleChange} required />
        <br />

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
