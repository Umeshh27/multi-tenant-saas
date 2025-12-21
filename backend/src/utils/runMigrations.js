import fs from "fs";
import path from "path";
import pool from "../config/db.js";

const migrationsDir = "/app/database/migrations";
const seedsDir = "/app/database/seeds";

const runSQLFiles = async (dir) => {
  const files = fs.readdirSync(dir).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");
    await pool.query(sql);
  }
};

export const runMigrationsAndSeeds = async () => {
  await runSQLFiles(migrationsDir);
  await runSQLFiles(seedsDir);
};
