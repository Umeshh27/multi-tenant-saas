import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/projects", authMiddleware, createProject);
router.get("/projects", authMiddleware, listProjects);
router.put("/projects/:projectId", authMiddleware, updateProject);
router.delete("/projects/:projectId", authMiddleware, deleteProject);

export default router;
