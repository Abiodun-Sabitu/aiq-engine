import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

//  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP DEFAULT NULL
const updateDatabase = async () => {
  try {
    await db.query(`
  ALTER TABLE user_progress
  DROP COLUMN started_at,
  DROP COLUMN completed_at;
`);
    console.log("✅ Tables dropped and recreated successfully!");
  } catch (error) {
    console.error("❌ Error during DB migration:", error);
  } finally {
    await db.end();
  }
};

// Run the migration
updateDatabase();
