import pool from "../config/db.js";
import auditLog from "../utils/auditLogger.js";

/* ===============================
   GET TENANT DETAILS (API 5)
================================ */
export const getTenantById = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user;

  try {
    if (user.role !== "super_admin" && user.tenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to tenant",
      });
    }

    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan,
              max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const statsResult = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) AS total_tasks`,
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...tenantResult.rows[0],
        stats: statsResult.rows[0],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tenant details",
    });
  }
};

/* ===============================
   UPDATE TENANT (API 6)
================================ */
export const updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const user = req.user;
  const updates = req.body;

  try {
    if (user.role !== "super_admin" && user.role !== "tenant_admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    if (user.role === "tenant_admin") {
      if (updates.status || updates.subscriptionPlan || updates.maxUsers || updates.maxProjects) {
        return res.status(403).json({
          success: false,
          message: "Tenant admin cannot update subscription or status",
        });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (updates.name) {
      fields.push(`name = $${index++}`);
      values.push(updates.name);
    }
    if (user.role === "super_admin") {
      if (updates.status) {
        fields.push(`status = $${index++}`);
        values.push(updates.status);
      }
      if (updates.subscriptionPlan) {
        fields.push(`subscription_plan = $${index++}`);
        values.push(updates.subscriptionPlan);
      }
      if (updates.maxUsers) {
        fields.push(`max_users = $${index++}`);
        values.push(updates.maxUsers);
      }
      if (updates.maxProjects) {
        fields.push(`max_projects = $${index++}`);
        values.push(updates.maxProjects);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    values.push(tenantId);

    const result = await pool.query(
      `UPDATE tenants
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING id, name`,
      values
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    await auditLog({
      tenantId,
      userId: user.userId,
      action: "UPDATE_TENANT",
      entityType: "tenant",
      entityId: tenantId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Tenant updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update tenant",
    });
  }
};

/* ===============================
   LIST ALL TENANTS (API 7)
================================ */
export const listTenants = async (req, res) => {
  const { page = 1, limit = 10, status, subscriptionPlan } = req.query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [];
    const values = [];
    let index = 1;

    if (status) {
      conditions.push(`status = $${index++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      conditions.push(`subscription_plan = $${index++}`);
      values.push(subscriptionPlan);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const tenantsResult = await pool.query(
      `SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan,
              t.created_at,
              (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS total_users,
              (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) AS total_projects
       FROM tenants t
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tenants ${whereClause}`,
      values
    );

    return res.status(200).json({
      success: true,
      data: {
        tenants: tenantsResult.rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countResult.rows[0].count / limit),
          totalTenants: Number(countResult.rows[0].count),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to list tenants",
    });
  }
};
