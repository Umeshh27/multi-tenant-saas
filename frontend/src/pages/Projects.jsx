import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { FolderPlus, Trash2, ArrowRight } from "lucide-react";

function Projects() {
  const { loading, isTenantAdmin } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* ===============================
     FETCH PROJECTS
  =============================== */
  useEffect(() => {
    if (loading) return;

    api
      .get("/projects")
      .then((res) => {
        const data = res.data?.data?.projects;
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Failed to load projects");
        setProjects([]);
      });
  }, [loading]);

  /* ===============================
     ADD PROJECT
  =============================== */
  const handleAddProject = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/projects", {
        name,
        description,
      });

      setProjects((prev) => [...prev, res.data.data]);
      setName("");
      setDescription("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Project limit reached for your plan");
      } else {
        setError("Failed to create project");
      }
    }
  };

  /* ===============================
     DELETE PROJECT
  =============================== */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <FolderPlus size={28} className="text-muted" color="var(--text-muted)" />
          <h2 style={{ fontSize: "1.2rem", color: "var(--text-muted)", margin: 0 }}>Projects</h2>
        </div>
        <button className="btn-secondary btn-sm" onClick={() => window.history.back()}>&larr; Back</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ================= ADD PROJECT ================= */}
      {isTenantAdmin() && (
        <div className="inline-form">
          <h4 style={{ marginBottom: "15px", color: "var(--text-main)" }}>Create New Project</h4>
          <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="form-group">
              <label>Project Name</label>
              <input
                type="text"
                placeholder="e.g. Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Brief details about the project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" style={{ width: "auto" }}>+ Create Project</button>
            </div>
          </form>
        </div>
      )}

      {/* ================= PROJECT LIST ================= */}
      {projects.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "var(--card-bg)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          No projects found.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created At</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td style={{ fontWeight: "600", color: "var(--text-main)" }}>{project.name}</td>
                <td style={{ color: "var(--text-muted)" }}>{project.description || "-"}</td>
                <td>
                  <span style={{ fontSize: "0.9rem", color: project.status === 'active' ? "#10b981" : "#a8a29e", fontWeight: "500" }}>
                    ● {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  {new Date(project.created_at).toLocaleDateString()}
                </td>

                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    style={{ marginRight: "8px" }}
                  >
                    View <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                  </button>

                  {isTenantAdmin() && (
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Projects;
