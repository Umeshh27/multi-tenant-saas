import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/* ===============================
   REGISTER TENANT
================================ */
export const registerTenant = async (req, res) => {
  const {
    tenantName,
    subdomain,
    adminEmail,
    adminPassword,
    adminFullName,
  } = req.body;

  // ✅ BASIC VALIDATION
  if (
    !tenantName ||
    !subdomain ||
    !adminEmail ||
    !adminPassword ||
    !adminFullName
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ CREATE TENANT WITH DEFAULT FREE PLAN
    const tenantResult = await client.query(
      `INSERT INTO tenants 
       (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3)
       RETURNING id, subdomain`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    // ✅ HASH PASSWORD
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // ✅ CREATE TENANT ADMIN USER
    const userResult = await client.query(
      `INSERT INTO users 
       (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, passwordHash, adminFullName]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: userResult.rows[0],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("REGISTER TENANT ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    client.release();
  }
};

/* ===============================
   LOGIN
================================ */
export const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    const tenantResult = await pool.query(
      "SELECT id, name, status, subscription_plan FROM tenants WHERE subdomain = $1",
      [tenantSubdomain]
    );

    if (tenantResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active",
      });
    }

    const userResult = await pool.query(
      `SELECT * FROM users
       WHERE email = $1 AND tenant_id = $2 AND is_active = true`,
      [email, tenant.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // ✅ IMPORTANT FIX: snake_case fields
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          tenant_id: user.tenant_id,
          // Include tenant details for frontend display
          tenant_name: tenant.name || tenantResult.rows[0].name, // Ensure we select name in the tenant query above if not already
          subscription_plan: tenant.subscription_plan || tenantResult.rows[0].subscription_plan,
        },
        token,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* ===============================
   GET CURRENT USER
================================ */
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.id,
         u.email,
         u.full_name,
         u.role,
         u.is_active,
         t.id AS tenant_id,
         t.name AS tenant_name,
         t.subdomain,
         t.subscription_plan,
         t.max_users,
         t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

/* ===============================
   LOGOUT
================================ */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
