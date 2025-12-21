import express from "express";
import {
  registerTenant,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register-tenant", registerTenant);
router.post("/login", login);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
