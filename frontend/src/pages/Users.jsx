import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Users() {
  const { user, loading, isTenantAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");

  /* =========================
     FETCH USERS
  ========================= */
  useEffect(() => {
    if (loading) return;
    if (!user?.tenant_id) return;

    api
      .get(`/tenants/${user.tenant_id}/users`)
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data?.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      })
      .catch(() => {
        setError("Failed to load users");
        setUsers([]);
      });
  }, [user, loading]);

  /* =========================
     ADD USER
  ========================= */
  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post(
        `/tenants/${user.tenant_id}/users`,
        { email, fullName, role }
      );

      const newUser = res.data?.data;
      if (newUser) {
        setUsers((prev) => [...prev, newUser]);
      }

      setEmail("");
      setFullName("");
      setRole("user");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  /* =========================
     DELETE USER
  ========================= */
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h2>Team Members</h2>
        <button className="btn-secondary" onClick={() => window.history.back()}>&larr; Back</button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* ================= ADD USER FORM ================= */}
      {isTenantAdmin() && (
        <div className="inline-form">
          <h4 style={{ marginBottom: "15px" }}>Add New Member</h4>
          <form onSubmit={handleAddUser} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label>Full Name</label>
              <input
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label>Email Address</label>
              <input
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 0.5, minWidth: "150px" }}>
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", background: "#f9fafb" }}
              >
                <option value="user">User</option>
                <option value="tenant_admin">Admin</option>
              </select>
            </div>
            <div style={{ paddingBottom: "15px" }}>
              <button type="submit" style={{ width: "auto" }}>+ Add</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= USERS TABLE ================= */}
      {users.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280", background: "white", borderRadius: "8px" }}>
          No users found.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              {isTenantAdmin() && <th style={{ textAlign: "right" }}>Action</th>}
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: "500" }}>{u.full_name}</td>
                <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td>
                  <span style={{
                    fontSize: "0.8rem",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: u.role === 'tenant_admin' ? "#e0e7ff" : "#f3f4f6",
                    color: u.role === 'tenant_admin' ? "#4338ca" : "#374151"
                  }}>
                    {u.role === 'tenant_admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <span style={{ color: u.is_active ? "#059669" : "#dc2626", fontWeight: "500", fontSize: "0.9rem" }}>
                    {u.is_active ? "● Active" : "● Inactive"}
                  </span>
                </td>

                {isTenantAdmin() && (
                  <td style={{ textAlign: "right" }}>
                    {user.id !== u.id && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Users;
