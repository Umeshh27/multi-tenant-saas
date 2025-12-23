import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddUserModal from "../components/AddUserModal";

function Users() {
  const { user, isTenantAdmin } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api
      .get(`/tenants/${user.tenant_id}/users`)
      .then((res) => setUsers(res.data.data.users))
      .catch(() => alert("Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isTenantAdmin) {
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="container">
      <h2>Users</h2>

      <button onClick={() => setShowModal(true)}>
        + Add User
      </button>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AddUserModal
          tenantId={user.tenant_id}
          onClose={() => setShowModal(false)}
          onUserAdded={fetchUsers}
        />
      )}
    </div>
  );
}

export default Users;
