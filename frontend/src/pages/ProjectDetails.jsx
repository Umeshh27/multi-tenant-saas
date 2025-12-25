import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft as ArrowBack,
  Calendar,
  User
} from "lucide-react";

function ProjectDetails() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------- ADD TASK ---------- */
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");

  /* ---------- EDIT MODAL ---------- */
  const [showEdit, setShowEdit] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editAssignedTo, setEditAssignedTo] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("todo");

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
        assignedTo: assignedTo || null
      });
      setTitle("");
      setPriority("medium");
      setAssignedTo("");
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
    setEditStatus(task.status);
    setEditAssignedTo(task.assigned_to || "");
    setEditDueDate(task.due_date ? task.due_date.split('T')[0] : "");
    setShowEdit(true);
  };

  /* ===============================
     UPDATE TASK
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
      case "todo": return "#f59e0b"; // Amber 500
      case "in_progress": return "#3b82f6"; // Blue 500
      case "completed": return "#10b981"; // Emerald 500
      default: return "#6b7280";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#ef4444";
      case "medium": return "#f59e0b";
      case "low": return "#3b82f6";
      default: return "#6b7280";
    }
  };

  const columns = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" }
  ];

  if (loading) return <div className="container" style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading project...</div>;

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--text-main)", margin: 0 }}>Project Tasks</h2>
        </div>
        <button className="btn-secondary btn-sm" onClick={() => window.history.back()}>
          <ArrowLeft size={16} style={{ marginRight: "5px" }} /> Back to Projects
        </button>
      </div>

      {/* ADD TASK FORM */}
      <div className="inline-form">
        <h4 style={{ marginBottom: "15px", color: "var(--text-main)" }}>Add New Task</h4>
        <form onSubmit={handleAddTask} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="form-group">
            <label>New Task Title</label>
            <input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" style={{ height: "42px", width: "auto" }}>
              <Plus size={18} style={{ marginRight: "5px" }} /> Add Task
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {/* KANBAN BOARD */}
      <div style={{ display: "flex", gap: "20px", overflowX: "auto", paddingBottom: "20px" }}>
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} style={{ flex: 1, minWidth: "320px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "15px", display: "flex", flexDirection: "column" }}>
              <h4 style={{ margin: "0 0 15px 0", paddingBottom: "10px", borderBottom: `2px solid ${getStatusColor(col.key)}`, textTransform: "uppercase", fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between" }}>
                {col.label} <span style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "2px 8px", fontSize: "0.8rem", color: "var(--text-main)" }}>{colTasks.length}</span>
              </h4>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                {colTasks.map(task => (
                  <div key={task.id} style={{ background: "var(--card-bg)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border-color)", cursor: "grab", transition: "transform 0.1s" }}>

                    {/* PRIORITY & DATE */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: "bold", color: "#fff", background: getPriorityColor(task.priority), padding: "2px 8px", borderRadius: "12px", textTransform: "uppercase" }}>
                        {task.priority}
                      </span>
                      {task.due_date && (
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={12} />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <h5 style={{ margin: "0 0 8px 0", fontSize: "1rem", color: "var(--text-main)", lineHeight: "1.4" }}>{task.title}</h5>

                    {task.description && <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 12px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.description}</p>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "var(--text-muted)", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <User size={14} />
                        {task.assigned_name || "Unassigned"}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", alignItems: "center" }}>

                      {col.key !== 'todo' ? (
                        <button title="Move Back" onClick={() => updateStatus(task.id, col.key === 'completed' ? 'in_progress' : 'todo')} className="btn-secondary" style={{ padding: "6px", width: "auto" }}>
                          <ArrowBack size={14} />
                        </button>
                      ) : <div style={{ width: "28px" }}></div>}

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => openEditModal(task)} className="btn-secondary" style={{ padding: "6px", width: "auto" }} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="btn-danger" style={{ padding: "6px", width: "auto" }} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {col.key !== 'completed' ? (
                        <button title="Move Forward" onClick={() => updateStatus(task.id, col.key === 'todo' ? 'in_progress' : 'completed')} className="btn-secondary" style={{ padding: "6px", width: "auto" }}>
                          <ArrowRight size={14} />
                        </button>
                      ) : <div style={{ width: "28px" }}></div>}

                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", border: "1px dashed var(--border-color)", borderRadius: "6px", opacity: 0.5 }}>No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {showEdit && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center",
          backdropFilter: "blur(2px)"
        }}>
          <div style={{
            background: "var(--card-bg)", padding: "30px", borderRadius: "var(--radius)", width: "500px", maxWidth: "90%",
            boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)"
          }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid var(--border-color)", paddingBottom: "15px", marginBottom: "20px" }}>Edit Task</h3>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Title</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label>Description</label>
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} />
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }} className="form-group">
                <label>Priority</label>
                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ flex: 1 }} className="form-group">
                <label>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
              <div style={{ flex: 1 }} className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={editDueDate || ""}
                  onChange={e => setEditDueDate(e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }} className="form-group">
                <label>Assigned To</label>
                <select value={editAssignedTo} onChange={e => setEditAssignedTo(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
              <button onClick={() => setShowEdit(false)} className="btn-secondary" style={{ width: "auto" }}>Cancel</button>
              <button onClick={updateTask} style={{ width: "auto" }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetails;
