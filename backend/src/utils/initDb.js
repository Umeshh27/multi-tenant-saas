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

    // Create migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    // Get applied migrations
    const { rows: appliedMigrations } = await client.query("SELECT migration_name FROM schema_migrations");
    const appliedSet = new Set(appliedMigrations.map(m => m.migration_name));

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        // console.log(`Skipping applied migration: ${file}`);
        continue;
      }

      console.log(`Executing migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (migration_name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`✅ Applied migration: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`❌ Failed to apply migration ${file}:`, err);
        throw err;
      }
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
