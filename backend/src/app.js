import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

dotenv.config();

const app = express();

/* ===============================
   MIDDLEWARE (ORDER IS CRITICAL)
================================ */

// JSON parser MUST come first
app.use(express.json());

// CORS (ONLY ONCE)
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
  })
);

/* ===============================
   ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

/* ===============================
   HEALTH CHECK
================================ */

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

/* ===============================
   SERVER
================================ */

const PORT = process.env.PORT || 5000;

// 🚨 THIS IS IMPORTANT FOR DOCKER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;