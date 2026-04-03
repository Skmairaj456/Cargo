const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const initDb = require("./models/initDb");
const { getOrCreateSeedDrivers } = require("./models/driverModel");

const PORT = process.env.PORT || 5000;

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const bootstrapDatabase = async () => {
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await initDb();
      await getOrCreateSeedDrivers();
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.log(`DB not ready (attempt ${attempt}/${maxAttempts}), retrying...`);
      // eslint-disable-next-line no-await-in-loop
      await sleep(3000);
    }
  }
};

const startServer = async () => {
  try {
    await bootstrapDatabase();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`QuickCargo API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
