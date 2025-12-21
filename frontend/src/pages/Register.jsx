import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.adminPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register-tenant", {
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminFullName: form.adminFullName,
      });

      alert("Tenant registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tenant Registration</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="tenantName" placeholder="Organization Name" onChange={handleChange} required />
        <br />

        <input name="subdomain" placeholder="Subdomain" onChange={handleChange} required />
        <br />

        <input name="adminEmail" type="email" placeholder="Admin Email" onChange={handleChange} required />
        <br />

        <input name="adminFullName" placeholder="Admin Full Name" onChange={handleChange} required />
        <br />

        <input name="adminPassword" type="password" placeholder="Password" onChange={handleChange} required />
        <br />

        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />
        <br />

        <button disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
