import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure your DB connection is set in .env
});

const updateDatabase = async () => {
  try {
    // Alter the user_progress table to modify the progress_status column
    await db.query(`
      ALTER TABLE user_progress
  ALTER COLUMN progress_status SET DEFAULT 'in_progress',
  DROP CONSTRAINT IF EXISTS progress_status_check,
  ADD CONSTRAINT progress_status_check CHECK (progress_status IN ('in_progress', 'completed'));
    `);

    console.log("✅ user_progress table updated successfully!");
  } catch (error) {
    console.error("❌ Error updating user_progress table:", error);
  } finally {
    await db.end();
  }
};

// Run the migration
updateDatabase();
