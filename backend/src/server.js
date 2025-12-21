import app from "./app.js";
import { runMigrationsAndSeeds } from "./utils/runMigrations.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await runMigrationsAndSeeds();
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
};

startServer();
