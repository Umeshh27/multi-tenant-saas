import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

const migrationsDir = path.join(process.cwd(), "database/migrations");

(async () => {
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await pool.query(sql);
    console.log(`✔ Migration executed: ${file}`);
  }

  process.exit(0);
})();
