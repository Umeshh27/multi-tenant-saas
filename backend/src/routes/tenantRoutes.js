import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getTenantById,
  updateTenant,
  listTenants,
} from "../controllers/tenantController.js";

const router = express.Router();

/* Tenant Admin OR Super Admin */
router.get("/:tenantId", authenticate, getTenantById);
router.put("/:tenantId", authenticate, updateTenant);

/* Super Admin ONLY */
router.get(
  "/",
  authenticate,
  roleMiddleware(["super_admin"]),
  listTenants
);

export default router;
