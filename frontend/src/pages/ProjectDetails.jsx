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
    // FIX: tenant_id is on the user object, not nested in a tenant object
    const tenantId = me.data.data.tenant_id;
    const res = await api.get(`/tenants/${tenantId}/users`);
    setUsers(res.data.data.users || []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchTasks();
        await fetchUsers();
      } catch (err) {
        console.error("Failed to load project details:", err);
        setError(err.response?.data?.message || err.message || "Failed to load project details");
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
  /* ===============================
     OPEN EDIT MODAL
  =============================== */
  const [editStatus, setEditStatus] = useState("todo");

  const openEditModal = (task) => {
    setEditTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditPriority(task.priority);
    setEditStatus(task.status);
    setEditAssignedTo(task.assigned_to || "");
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : "");
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
        status: editStatus,
        assignedTo: editAssignedTo || null,
        dueDate: editDueDate || null,
      });

      setShowEdit(false);
      setEditTask(null);
      await fetchTasks();
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error("Delete Task Error:", err);
      alert(err.response?.data?.message || "Failed to delete task");
    }
  };

  /* ===============================
     KANBAN HELPERS
  =============================== */
  const getStatusColor = (status) => {
    switch (status) {
      case "todo": return "#f0ad4e";
      case "in_progress": return "#0275d8";
      case "completed": return "#5cb85c";
      default: return "#999";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#d9534f";
      case "medium": return "#f0ad4e";
      case "low": return "#5bc0de";
      default: return "#777";
    }
  };

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" }
  ];

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <button onClick={() => window.history.back()} style={{ marginBottom: "20px", cursor: "pointer" }}>&larr; Back to Projects</button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Project Tasks</h2>
        {/* ADD TASK FORM TOGGLE OR INLINE (Keeping inline as per original, just styled better) */}
      </div>

      {/* ADD TASK FORM */}
      <form onSubmit={handleAddTask} style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "30px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input
          placeholder="New Task Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <button style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Add Task</button>
      </form>

      {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

      {/* KANBAN BOARD */}
      <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" }}>
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={{ flex: 1, minWidth: "300px", background: "#f4f5f7", borderRadius: "8px", padding: "15px", display: "flex", flexDirection: "column" }}>
              <h4 style={{ margin: "0 0 15px 0", paddingBottom: "10px", borderBottom: `3px solid ${getStatusColor(col.key)}`, textTransform: "uppercase", fontSize: "0.85rem", color: "#5e6c84" }}>
                {col.label} <span style={{ background: "#dfe1e6", borderRadius: "10px", padding: "2px 8px", fontSize: "0.8rem", marginLeft: "5px" }}>{colTasks.length}</span>
              </h4>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                {colTasks.map(task => (
                  <div key={task.id} style={{ background: "white", padding: "12px", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "pointer", transition: "transform 0.1s" }}>

                    {/* STATUS SELECT */}
                    <div style={{ marginBottom: "8px" }}>
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: "0.75rem", padding: "2px 4px", borderRadius: "4px", border: "1px solid #ccc", background: "#f9f9f9", width: "100%" }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    {/* PRIORITY BADGE */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "white", background: getPriorityColor(task.priority), padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>
                        {task.priority}
                      </span>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : ""}
                      </div>
                    </div>

                    <h5 style={{ margin: "0 0 5px 0", fontSize: "1rem", color: "#172b4d" }}>{task.title}</h5>

                    {task.description && <p style={{ fontSize: "0.85rem", color: "#5e6c84", margin: "0 0 10px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.description}</p>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#5e6c84" }}>
                      <span>👤 {task.assigned_user?.fullName || "Unassigned"}</span>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: "5px", justifyContent: "flex-end" }}>
                      {col.key !== 'todo' && (
                        <button title="Move Back" onClick={() => updateStatus(task.id, col.key === 'completed' ? 'in_progress' : 'todo')} style={{ background: "none", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem" }}>⬅️</button>
                      )}

                      <button onClick={() => openEditModal(task)} style={{ background: "none", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem" }}>✏️</button>
                      <button onClick={() => deleteTask(task.id)} style={{ background: "none", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem", color: "#d9534f" }}>🗑️</button>

                      {col.key !== 'completed' && (
                        <button title="Move Forward" onClick={() => updateStatus(task.id, col.key === 'todo' ? 'in_progress' : 'completed')} style={{ background: "none", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", fontSize: "0.8rem" }}>➡️</button>
                      )}
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "0.9rem", border: "2px dashed #e0e0e0", borderRadius: "6px" }}>No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            background: "#fff", padding: "25px", borderRadius: "8px", width: "450px", maxWidth: "90%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ marginTop: 0 }}>Edit Task</h3>

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Title</label>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px" }} />

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Description</label>
            <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "4px", minHeight: "80px" }} />

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Priority</label>
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Due Date</label>
                <input
                  type="date"
                  value={editDueDate || ""}
                  onChange={e => setEditDueDate(e.target.value)}
                  style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            </div>

            <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem" }}>Assigned To</label>
            <select value={editAssignedTo} onChange={e => setEditAssignedTo(e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "25px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowEdit(false)} style={{ padding: "8px 15px", background: "transparent", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
              <button onClick={updateTask} style={{ padding: "8px 15px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
