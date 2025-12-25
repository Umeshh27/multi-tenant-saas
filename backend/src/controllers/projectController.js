import pool from "../config/db.js";
import auditLog from "../utils/auditLogger.js";

/* ===============================
   CREATE PROJECT (API 12)
================================ */
export const createProject = async (req, res) => {
  const { name, description, status = "active" } = req.body;
  const { tenantId, userId } = req.user;

  try {
    const tenantResult = await pool.query(
      "SELECT max_projects FROM tenants WHERE id = $1",
      [tenantId]
    );

    const projectCountResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    if (
      Number(projectCountResult.rows[0].count) >=
      tenantResult.rows[0].max_projects
    ) {
      return res.status(403).json({
        success: false,
        message: "Project limit reached",
      });
    }

    const result = await pool.query(
      `INSERT INTO projects
       (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, tenant_id, name, description, status, created_by, created_at`,
      [tenantId, name, description, status, userId]
    );

    await auditLog({
      tenantId,
      userId,
      action: "CREATE_PROJECT",
      entityType: "project",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

/* ===============================
   LIST PROJECTS (API 13)
================================ */
export const listProjects = async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const { tenantId } = req.user;
  const offset = (page - 1) * limit;

  try {
    const conditions = ["p.tenant_id = $1"];
    const values = [tenantId];
    let index = 2;

    if (status) {
      conditions.push(`p.status = $${index}`);
      values.push(status);
      index++;
    }

    if (search) {
      conditions.push(`p.name ILIKE $${index}`);
      values.push(`%${search}%`);
      index++;
    }

    const projectsResult = await pool.query(
  `SELECT 
      p.id,
      p.name,
      p.description,
      p.status,
      p.created_at,
      u.full_name AS creator_name,
      COALESCE(
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id), 0
      ) AS task_count
   FROM projects p
   LEFT JOIN users u ON p.created_by = u.id
   WHERE p.tenant_id = $1
   ORDER BY p.created_at DESC`,
  [tenantId]
);


    const countResult = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    return res.status(200).json({
      success: true,
      data: {
        projects: projectsResult.rows,
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
      message: "Failed to fetch projects",
    });
  }
};

/* ===============================
   UPDATE PROJECT (API 14)
================================ */
export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const updates = req.body;
  const { tenantId, userId, role } = req.user;

  try {
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    if (
      project.tenant_id !== tenantId ||
      (role !== "tenant_admin" && project.created_by !== userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (updates.name) {
      fields.push(`name = $${index++}`);
      values.push(updates.name);
    }
    if (updates.description) {
      fields.push(`description = $${index++}`);
      values.push(updates.description);
    }
    if (updates.status) {
      fields.push(`status = $${index++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    values.push(projectId);

    const result = await pool.query(
      `UPDATE projects
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING id, name, description, status, updated_at`,
      values
    );

    await auditLog({
      tenantId,
      userId,
      action: "UPDATE_PROJECT",
      entityType: "project",
      entityId: projectId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

/* ===============================
   DELETE PROJECT (API 15)
================================ */
export const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId, userId, role } = req.user;

  try {
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const project = projectResult.rows[0];

    if (
      project.tenant_id !== tenantId ||
      (role !== "tenant_admin" && project.created_by !== userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);

    await auditLog({
      tenantId,
      userId,
      action: "DELETE_PROJECT",
      entityType: "project",
      entityId: projectId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};
