import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/projects/:projectId/tasks", authenticate, createTask);
router.get("/projects/:projectId/tasks", authenticate, listProjectTasks);
router.patch("/tasks/:taskId/status", authenticate, updateTaskStatus);
router.put("/tasks/:taskId", authenticate, updateTask);
router.delete("/tasks/:taskId", authenticate, deleteTask);

export default router;
