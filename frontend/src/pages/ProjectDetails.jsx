import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function ProjectDetails() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- ADD TASK ---------- */
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");

  /* ---------- EDIT MODAL ---------- */
  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  /* ===============================
     FETCH TASKS
  =============================== */
  const fetchTasks = async () => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    setTasks(res.data.data.tasks || []);
  };

  /* ===============================
     FETCH USERS
  =============================== */
  const fetchUsers = async () => {
    const me = await api.get("/auth/me");
    const tenantId = me.data.data.tenant.id;
    const res = await api.get(`/tenants/${tenantId}/users`);
    setUsers(res.data.data.users || []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchTasks();
        await fetchUsers();
      } catch {
        setError("Failed to load project details");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  /* ===============================
     ADD TASK
  =============================== */
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        title,
        priority,
      });
      setTitle("");
      setPriority("medium");
      await fetchTasks();
    } catch {
      setError("Failed to create task");
    }
  };

  /* ===============================
     OPEN EDIT MODAL
  =============================== */
  const openEditModal = (task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditAssignedTo(task.assigned_to || "");
    setEditDueDate(task.due_date || "");
    setShowEdit(true);
  };

  /* ===============================
     UPDATE TASK (API 19) ✅
  =============================== */
  const updateTask = async () => {
    try {
      await api.put(`/tasks/${editTask.id}`, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        assigned_to: editAssignedTo || null,
        dueDate: editDueDate || null,
      });

      setShowEdit(false);
      setEditTask(null);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  /* ===============================
     UPDATE STATUS
  =============================== */
  const updateStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      await fetchTasks();
    } catch {
      alert("Failed to update status");
    }
  };

  /* ===============================
     DELETE TASK
  =============================== */
  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      await fetchTasks();
    } catch {
      alert("Failed to delete task");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Project Tasks</h2>

      {/* ADD TASK */}
      <form onSubmit={handleAddTask}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button>Add Task</button>
      </form>

      <hr />

      {/* TASK LIST */}
      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <table border="1" width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      updateStatus(t.id, e.target.value)
                    }
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td>{t.priority}</td>
                <td>{t.assigned_user?.fullName || "Unassigned"}</td>
                <td>
                  <button onClick={() => openEditModal(t)}>Edit</button>
                  <button onClick={() => deleteTask(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)"
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            width: "400px",
            margin: "100px auto"
          }}>
            <h3>Edit Task</h3>

            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} />

            <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select value={editAssignedTo} onChange={e => setEditAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              <option value="">assigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>

            <input
              type="date"
              value={editDueDate || ""}
              onChange={e => setEditDueDate(e.target.value)}
            />

            <br /><br />
            <button onClick={updateTask}>Save</button>
            <button onClick={() => setShowEdit(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
