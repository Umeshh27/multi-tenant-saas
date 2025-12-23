import { useState } from "react";
import api from "../api/api";

function AddUserModal({ tenantId, onClose, onUserAdded }) {
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    role: "user",
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
      await api.post(`/tenants/${tenantId}/users`, form);
      onUserAdded();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "User creation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Add User</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <select name="role" onChange={handleChange}>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <div style={{ marginTop: "10px" }}>
            <button disabled={loading}>
              {loading ? "Adding..." : "Add User"}
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUserModal;
