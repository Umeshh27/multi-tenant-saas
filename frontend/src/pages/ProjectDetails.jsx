import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  /* LOAD PROJECT */
  useEffect(() => {
    api
      .get(`/projects/${projectId}`)
      .then((res) => setProject(res.data.data));
  }, [projectId]);

  /* LOAD TASKS */
  useEffect(() => {
    api
      .get(`/projects/${projectId}/tasks`)
      .then((res) => setTasks(res.data.data.tasks || []));
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

  /* UPDATE STATUS */
  const updateStatus = async (id, status) => {
    await api.patch(`/tasks/${id}/status`, { status });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status } : t
      )
    );
  };

  if (!project) return <p>Loading project...</p>;

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjectDetails;
