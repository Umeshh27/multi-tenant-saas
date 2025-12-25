import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);

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

    if (!acceptTerms) {
      setError("You must accept Terms & Conditions");
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

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container register">
      <h2>Create Your Account</h2>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Organization Name</label>
          <input name="tenantName" placeholder="e.g. Acme Corp" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Subdomain (Workspace URL)</label>
          <input name="subdomain" placeholder="acme" onChange={handleChange} required />
          <small style={{ marginTop: "-5px", color: "#6b7280", fontSize: "0.8rem" }}>Your site will be: {form.subdomain || "your-company"}.saas.com</small>
        </div>

        <div className="form-group">
          <label>Admin Name</label>
          <input name="adminFullName" placeholder="John Doe" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Admin Email</label>
          <input name="adminEmail" type="email" placeholder="john@acme.com" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input name="adminPassword" type="password" minLength={8} maxLength={20} placeholder="Create a strong password" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" placeholder="Repeat password" onChange={handleChange} required />
        </div>

        <div className="checkbox-group">
          <input type="checkbox" id="terms" onChange={(e) => setAcceptTerms(e.target.checked)} />
          <label htmlFor="terms" style={{ cursor: "pointer" }}>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></label>
        </div>

        <button disabled={loading} className="btn-full">
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p>
        Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Sign in</a>
      </p>
    </div>
  );
}

export default Register;
