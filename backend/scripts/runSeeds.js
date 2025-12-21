import fs from "fs";
import path from "path";
import pool from "../src/config/db.js";

const seedFile = path.join(process.cwd(), "database/seeds/seed_data.sql");

(async () => {
  const sql = fs.readFileSync(seedFile, "utf8");
  await pool.query(sql);
  console.log("✔ Seed data inserted");
  process.exit(0);
})();
