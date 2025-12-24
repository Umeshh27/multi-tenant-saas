import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Projects() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/login");

    api
      .get(`/tenants/${user.tenant_id}/projects`)
      .then((res) => setProjects(res.data.data.projects))
      .catch(() => console.error("Failed to load projects"));
  }, [loading]);

  const addProject = async () => {
    if (!name) return;

    await api.post(`/tenants/${user.tenant_id}/projects`, { name });
    setName("");

    const res = await api.get(`/tenants/${user.tenant_id}/projects`);
    setProjects(res.data.data.projects);
  };

  return (
    <div className="container">
      <h2>Projects</h2>

      <input
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addProject}>Add Project</button>

      <ul>
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;
