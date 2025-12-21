import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import healthRoutes from "./routes/health.js";

dotenv.config();

const app = express();

/* =======================
   GLOBAL MIDDLEWARE
======================= */

// ✅ CORS — ALLOW FRONTEND
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://frontend:3000"
    ],
    credentials: true,
  })
);

// ✅ BODY PARSER (MUST BE BEFORE ROUTES)
app.use(express.json());

/* =======================
   ROUTES
======================= */

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", healthRoutes);

/* =======================
   SERVER START
======================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
