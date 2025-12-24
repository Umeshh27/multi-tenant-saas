import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { user, loading, isTenantAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  /* =========================
     FETCH PROJECTS
  ========================= */
  useEffect(() => {
    if (loading) return;

    api
      .get("/projects")
      .then((res) => {
        const data = res.data?.data;
        if (Array.isArray(data?.projects)) {
          setProjects(data.projects);
        } else {
          setProjects([]);
        }
      })
      .catch(() => {
        setError("Failed to load projects");
        setProjects([]);
      });
  }, [loading]);

  /* =========================
     ADD PROJECT
  ========================= */
  const handleAddProject = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/projects", {
        name,
        description,
      });

      const newProject = res.data?.data;
      if (newProject) {
        setProjects((prev) => [...prev, newProject]);
      }

      setName("");
      setDescription("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  /* =========================
     DELETE PROJECT
  ========================= */
  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h2>Projects</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= ADD PROJECT ================= */}
      {isTenantAdmin() && (
        <form onSubmit={handleAddProject} style={{ marginBottom: "20px" }}>
          <h4>Create Project</h4>

          <input
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Create</button>
        </form>
      )}

      {/* ================= PROJECTS TABLE ================= */}
      {projects.length === 0 ? (
        <p>No projects found</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created At</th>
              {isTenantAdmin() && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {projects.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.description || "-"}</td>
                <td>{p.status}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>

                {isTenantAdmin() && (
                  <td>
                    <button onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
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

export default Projects;
