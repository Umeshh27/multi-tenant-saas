import bcrypt from "bcrypt";
import pool from "../config/db.js";
import auditLog from "../utils/auditLogger.js";

/* ===============================
   ADD USER TO TENANT (API 8)
================================ */
export const addUser = async (req, res) => {
  const { tenantId } = req.params;
  const { email, fullName, role = "user" } = req.body;
  const currentUser = req.user;

  try {
    // 🔐 Authorization
    if (
      currentUser.role !== "tenant_admin" ||
      currentUser.tenantId !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔢 Subscription limit
    const tenantResult = await pool.query(
      "SELECT max_users FROM tenants WHERE id = $1",
      [tenantId]
    );

    const userCountResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE tenant_id = $1",
      [tenantId]
    );

    if (
      Number(userCountResult.rows[0].count) >=
      tenantResult.rows[0].max_users
    ) {
      return res.status(403).json({
        success: false,
        message: "Subscription limit reached",
      });
    }

    // 🔑 Generate temporary password
    const tempPassword = "User@123";
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // 👤 Create user
    const result = await pool.query(
      `INSERT INTO users 
       (tenant_id, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, is_active, created_at`,
      [tenantId, email, passwordHash, fullName, role]
    );

    // 📝 Audit log
    await auditLog({
      tenantId,
      userId: currentUser.userId,
      action: "CREATE_USER",
      entityType: "user",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("ADD USER ERROR:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email already exists in this tenant",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};


/* ===============================
   LIST TENANT USERS (API 9)
================================ */
export const listUsers = async (req, res) => {
  const { tenantId } = req.params;
  const { search, role, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    if (req.user.role !== "super_admin" && req.user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const conditions = ["tenant_id = $1"];
    const values = [tenantId];
    let index = 2;

    if (search) {
      conditions.push(`(email ILIKE $${index} OR full_name ILIKE $${index})`);
      values.push(`%${search}%`);
      index++;
    }

    if (role) {
      conditions.push(`role = $${index}`);
      values.push(role);
      index++;
    }

    const usersResult = await pool.query(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE ${conditions.join(" AND ")}
       ORDER BY created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: {
        users: usersResult.rows,
        total: Number(countResult.rows[0].count),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countResult.rows[0].count / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/* ===============================
   UPDATE USER (API 10)
================================ */
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;
  const currentUser = req.user;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    if (
      currentUser.role !== "tenant_admin" &&
      currentUser.userId !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      currentUser.role !== "tenant_admin" &&
      (updates.role !== undefined || updates.isActive !== undefined)
    ) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update role or status",
      });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (updates.fullName) {
      fields.push(`full_name = $${index++}`);
      values.push(updates.fullName);
    }
    if (currentUser.role === "tenant_admin") {
      if (updates.role) {
        fields.push(`role = $${index++}`);
        values.push(updates.role);
      }
      if (updates.isActive !== undefined) {
        fields.push(`is_active = $${index++}`);
        values.push(updates.isActive);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING id, full_name, role, is_active, updated_at`,
      values
    );

    await auditLog({
      tenantId: user.tenant_id,
      userId: currentUser.userId,
      action: "UPDATE_USER",
      entityType: "user",
      entityId: userId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

/* ===============================
   DELETE USER (API 11)
================================ */
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = req.user;

  try {
    if (currentUser.role !== "tenant_admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (currentUser.userId === userId) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete yourself",
      });
    }

    const userResult = await pool.query(
      "SELECT tenant_id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await pool.query(
      "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1",
      [userId]
    );

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    await auditLog({
      tenantId: userResult.rows[0].tenant_id,
      userId: currentUser.userId,
      action: "DELETE_USER",
      entityType: "user",
      entityId: userId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
