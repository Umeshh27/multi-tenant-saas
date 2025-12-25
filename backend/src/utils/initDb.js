import fs from "fs";
import path from "path";
import pool from "../config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log("🔄 Initializing database...");

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../../database/migrations");
    if (!fs.existsSync(migrationsDir)) {
        console.error("❌ Migrations directory not found at:", migrationsDir);
        return;
    }
    
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Ensure order

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`Executing migration: ${file}`);
      await client.query(sql);
    }
    
    // Seed data checks
    // Check if super_admin exists to determine if we need to seed
    const checkUser = await client.query("SELECT * FROM users WHERE role = 'super_admin'");
    if (checkUser.rowCount === 0) {
        console.log("🌱 Seeding database...");
        const seedPath = path.join(__dirname, "../../database/seeds/seed_data.sql");
         if (fs.existsSync(seedPath)) {
             const seedSql = fs.readFileSync(seedPath, "utf8");
             await client.query(seedSql);
             console.log("✅ Seed data loaded.");
         } else {
             console.warn("⚠️ Seed file not found:", seedPath);
         }
    } else {
        console.log("ℹ️ Database already seeded. Skipping.");
    }

    console.log("✅ Database initialization complete.");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1); // Exit if DB init fails
  } finally {
    client.release();
  }
};

export default initDb;
