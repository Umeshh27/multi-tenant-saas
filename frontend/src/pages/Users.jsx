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
    <div>
      <h2>Users</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= ADD USER FORM ================= */}
      {isTenantAdmin() && (
        <form onSubmit={handleAddUser} style={{ marginBottom: "20px" }}>
          <h4>Add User</h4>

          <input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <button type="submit">Add User</button>
        </form>
      )}

      {/* ================= USERS TABLE ================= */}
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              {isTenantAdmin() && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.is_active ? "Active" : "Inactive"}</td>

                {isTenantAdmin() && (
                  <td>
                    {user.id !== u.id && (
                      <button onClick={() => handleDelete(u.id)}>
                        Delete
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
