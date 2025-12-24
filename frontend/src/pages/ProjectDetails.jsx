import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  /* LOAD PROJECT */
  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then((res) => {
        setProject(res.data.data);
      })
      .catch(() => setError("Project not found"));
  }, [projectId]);

  /* LOAD TASKS */
  useEffect(() => {
    api
      .get(`/projects/${projectId}/tasks`)
      .then((res) => {
        setTasks(res.data.data.tasks || []);
      })
      .catch(() => setTasks([]));
  }, [projectId]);

  /* ADD TASK */
  const addTask = async (e) => {
    e.preventDefault();

    const res = await api.post(`/projects/${projectId}/tasks`, {
      title,
    });

    setTasks((prev) => [...prev, res.data.data]);
    setTitle("");
  };

  if (error) return <p>{error}</p>;
  if (!project) return <p>Loading project...</p>;

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description || "No description"}</p>

      <hr />

      <h3>Tasks</h3>

      <form onSubmit={addTask}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button>Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <p>No tasks</p>
      ) : (
        <ul>
          {tasks.map((t) => (
            <li key={t.id}>
              {t.title} — {t.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectDetails;
