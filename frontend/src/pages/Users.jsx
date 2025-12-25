import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Trash2, ArrowLeft } from "lucide-react";

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
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <UserPlus size={28} className="text-muted" color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.2rem", color: "var(--text-muted)", margin: 0 }}>Team Members</h2>
        </div>
        <button className="btn-secondary btn-sm" onClick={() => window.history.back()}>
          <ArrowLeft size={16} style={{ marginRight: "5px" }} /> Back
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* ================= ADD USER FORM ================= */}
      {isTenantAdmin() && (
        <div className="inline-form">
          <h4 style={{ marginBottom: "15px", color: "var(--text-main)" }}>Add New Member</h4>
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
              >
                <option value="user">User</option>
                <option value="tenant_admin">Admin</option>
              </select>
            </div>
            <div style={{ paddingBottom: "2px" }}>
              <button type="submit" style={{ width: "auto", height: "42px" }}>+ Add</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= USERS TABLE ================= */}
      {users.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
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
                <td style={{ fontWeight: "500", color: "var(--text-main)" }}>{u.full_name}</td>
                <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td>
                  <span style={{
                    fontSize: "0.8rem",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    background: u.role === 'tenant_admin' ? "rgba(99, 102, 241, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    color: u.role === 'tenant_admin' ? "#818cf8" : "var(--text-muted)",
                    border: u.role === 'tenant_admin' ? "1px solid rgba(99, 102, 241, 0.2)" : "1px solid var(--border-color)"
                  }}>
                    {u.role === 'tenant_admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <span style={{ color: u.is_active ? "#10b981" : "#ef4444", fontWeight: "500", fontSize: "0.9rem" }}>
                    {u.is_active ? "● Active" : "● Inactive"}
                  </span>
                </td>

                {isTenantAdmin() && (
                  <td style={{ textAlign: "right" }}>
                    {user.id !== u.id && (
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id)} title="Remove User">
                        <Trash2 size={14} />
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
