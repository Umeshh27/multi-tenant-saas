import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addUser,
  listUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/tenants/:tenantId/users", authMiddleware, addUser);
router.get("/tenants/:tenantId/users", authMiddleware, listUsers);
router.put("/users/:userId", authMiddleware, updateUser);
router.delete("/users/:userId", authMiddleware, deleteUser);

export default router;
