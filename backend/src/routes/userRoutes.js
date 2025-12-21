import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  addUser,
  listUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

/* Tenant Admin ONLY */
router.post(
  "/tenants/:tenantId/users",
  authenticate,
  roleMiddleware(["tenant_admin"]),
  addUser
);

/* Tenant Members */
router.get(
  "/tenants/:tenantId/users",
  authenticate,
  listUsers
);

/* Tenant Admin OR Self */
router.put(
  "/users/:userId",
  authenticate,
  updateUser
);

/* Tenant Admin ONLY */
router.delete(
  "/users/:userId",
  authenticate,
  roleMiddleware(["tenant_admin"]),
  deleteUser
);

export default router;
