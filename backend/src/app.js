import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import pool from "./config/db.js";
import initDb from "./utils/initDb.js";

dotenv.config();

const app = express();

/* ✅ MUST COME FIRST */
app.use(express.json());

/* ✅ CORS */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://frontend:3000",
    ],
    credentials: true,
  })
);

/* ✅ ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

/* ✅ HEALTH CHECK */
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

const PORT = process.env.PORT || 5000;

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export default app;
