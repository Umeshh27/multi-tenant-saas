import pool from "../config/db.js";
import auditLog from "../utils/auditLogger.js";

/* ===============================
   CREATE TASK (API 16)
================================ */
export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority = "medium", dueDate } = req.body;
  const { userId, tenantId } = req.user;

  try {
    const projectResult = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (projectResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const projectTenantId = projectResult.rows[0].tenant_id;

    if (projectTenantId !== tenantId) {
      return res.status(403).json({
        success: false,
        message: "Project does not belong to your tenant",
      });
    }

    if (assignedTo) {
      const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND tenant_id = $2",
        [assignedTo, tenantId]
      );

      if (userCheck.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Assigned user does not belong to tenant",
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (project_id, tenant_id, title, description, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, projectTenantId, title, description, priority, assignedTo, dueDate]
    );

    await auditLog({
      tenantId: projectTenantId,
      userId,
      action: "CREATE_TASK",
      entityType: "task",
      entityId: result.rows[0].id,
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

/* ===============================
   LIST PROJECT TASKS (API 17)
================================ */
export const listProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  const { tenantId } = req.user;

  try {
    const projectResult = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (
      projectResult.rowCount === 0 ||
      projectResult.rows[0].tenant_id !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const conditions = ["t.project_id = $1"];
    const values = [projectId];
    let index = 2;

    if (status) {
      conditions.push(`t.status = $${index}`);
      values.push(status);
      index++;
    }
    if (assignedTo) {
      conditions.push(`t.assigned_to = $${index}`);
      values.push(assignedTo);
      index++;
    }
    if (priority) {
      conditions.push(`t.priority = $${index}`);
      values.push(priority);
      index++;
    }
    if (search) {
      conditions.push(`t.title ILIKE $${index}`);
      values.push(`%${search}%`);
      index++;
    }

    const result = await pool.query(
      `SELECT t.*, u.full_name AS assigned_name, u.email AS assigned_email
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE ${conditions.join(" AND ")}
       ORDER BY t.priority DESC, t.due_date ASC
       LIMIT $${index} OFFSET $${index + 1}`,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        tasks: result.rows,
        pagination: {
          currentPage: Number(page),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("List Tasks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

/* ===============================
   UPDATE TASK STATUS (API 18)
================================ */
export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId, userId } = req.user;

  try {
    const taskResult = await pool.query(
      "SELECT tenant_id FROM tasks WHERE id = $1",
      [taskId]
    );

    if (
      taskResult.rowCount === 0 ||
      taskResult.rows[0].tenant_id !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, taskId]
    );

    await auditLog({
      tenantId,
      userId,
      action: "UPDATE_TASK_STATUS",
      entityType: "task",
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task status",
      error: error.message // Sending error to client for faster debugging (dev only)
    });
  }
};

/* ===============================
   UPDATE TASK (API 19)
================================ */
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const updates = req.body;
  const { tenantId, userId } = req.user;

  try {
    const taskResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );

    if (
      taskResult.rowCount === 0 ||
      taskResult.rows[0].tenant_id !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (updates.assignedTo !== undefined && updates.assignedTo !== null) {
      const userCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND tenant_id = $2",
        [updates.assignedTo, tenantId]
      );

      if (userCheck.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Assigned user does not belong to tenant",
        });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (updates.title) {
      fields.push(`title = $${index++}`);
      values.push(updates.title);
    }
    if (updates.description) {
      fields.push(`description = $${index++}`);
      values.push(updates.description);
    }
    if (updates.status) {
      fields.push(`status = $${index++}`);
      values.push(updates.status);
    }
    if (updates.priority) {
      fields.push(`priority = $${index++}`);
      values.push(updates.priority);
    }
    if (updates.assignedTo !== undefined) {
      fields.push(`assigned_to = $${index++}`);
      values.push(updates.assignedTo);
    }
    if (updates.dueDate !== undefined) {
      fields.push(`due_date = $${index++}`);
      values.push(updates.dueDate);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    values.push(taskId);

    const result = await pool.query(
      `UPDATE tasks
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${index}
       RETURNING *`,
      values
    );

    await auditLog({
      tenantId,
      userId,
      action: "UPDATE_TASK",
      entityType: "task",
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

/* ===============================
   DELETE TASK (API 20)
================================ */
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId, userId } = req.user;
  console.log(`[DELETE TASK] Request received for taskId: ${taskId} by user: ${userId}`);

  try {
    const taskResult = await pool.query(
      "SELECT tenant_id FROM tasks WHERE id = $1",
      [taskId]
    );

    if (
      taskResult.rowCount === 0 ||
      taskResult.rows[0].tenant_id !== tenantId
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Task not found or does not belong to your tenant",
      });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);

    await auditLog({
      tenantId,
      userId,
      action: "DELETE_TASK",
      entityType: "task",
      entityId: taskId,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};
