import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  getTenantById,
  updateTenant,
  listTenants,
} from "../controllers/tenantController.js";

const router = express.Router();

router.get("/:tenantId", authMiddleware, getTenantById);
router.put("/:tenantId", authMiddleware, updateTenant);
router.get("/", authMiddleware, roleMiddleware(["super_admin"]), listTenants);

export default router;
