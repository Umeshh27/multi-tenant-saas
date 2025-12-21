import express from "express";
import {authenticate} from "../middleware/authMiddleware.js";
import {
  createProject,
  listProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/projects", authenticate, createProject);
router.get("/projects", authenticate, listProjects);
router.put("/projects/:projectId", authenticate, updateProject);
router.delete("/projects/:projectId", authenticate, deleteProject);

export default router;
