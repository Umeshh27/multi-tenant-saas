import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Users() {
  const { user, loading, isTenantAdmin } = useAuth();
  const [users, setUsers] = useState([]); // ✅ always array
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    if (loading) return;
    if (!user?.tenant_id) return;

    api
      .get(`/tenants/${user.tenant_id}/users`)
      .then((res) => {
        // ✅ NORMALIZE RESPONSE
        const data = res.data?.data;

        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data?.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load users");
        setUsers([]);
      });
  }, [user, loading]);

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
    } catch {
      setError("Failed to add user");
    }
  };

  return (
    <div>
      <h2>Users</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {isTenantAdmin() && (
        <form onSubmit={handleAddUser}>
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

      <hr />

      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.full_name} ({u.email}) – {u.role}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
