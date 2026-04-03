const { Pool } = require("pg");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../../.env") });

if (!process.env.DATABASE_URL || String(process.env.DATABASE_URL).trim() === "") {
  throw new Error(
    "DATABASE_URL is missing. Copy server/.env.example to server/.env and set DATABASE_URL (e.g. postgresql://postgres:postgres@localhost:5432/quickcargo)."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = pool;
