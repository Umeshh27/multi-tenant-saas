import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/projects/:projectId/tasks", authMiddleware, createTask);
router.get("/projects/:projectId/tasks", authMiddleware, listProjectTasks);
router.patch("/tasks/:taskId/status", authMiddleware, updateTaskStatus);
router.put("/tasks/:taskId", authMiddleware, updateTask);

export default router;
