import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

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
    <div style={{ padding: "20px" }}>
      <h2>Projects</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= ADD PROJECT ================= */}
      {isTenantAdmin() && (
        <form onSubmit={handleAddProject} style={{ marginBottom: "20px" }}>
          <h4>Create Project</h4>

          <input
            type="text"
            placeholder="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <br /><br />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <br /><br />

          <button type="submit">Add Project</button>
        </form>
      )}

      {/* ================= PROJECT LIST ================= */}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.description || "-"}</td>
                <td>{project.status}</td>
                <td>
                  {new Date(project.created_at).toLocaleDateString()}
                </td>

                <td>
                  <button
                    onClick={() =>
                      navigate(`/projects/${project.id}`)
                    }
                  >
                    View Tasks
                  </button>

                  {isTenantAdmin() && (
                    <>
                      &nbsp;
                      <button
                        onClick={() =>
                          handleDeleteProject(project.id)
                        }
                      >
                        Delete
                      </button>
                    </>
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
