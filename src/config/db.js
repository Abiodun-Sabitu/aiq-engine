import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Create a database pool (allows multiple connections)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection once at startup
pool
  .query("SELECT NOW()")
  .then((res) => console.log("✅ Connected to PostgreSQL at:", res.rows[0].now))
  .catch((err) => console.error("❌ Database connection error:", err));

export default pool;
