import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure your DB connection is set in .env
});

//Function to update the database schema
const updateDatabase = async () => {
  try {
    // Alter the user_progress table to add new columns
    await db.query(`
      ALTER TABLE user_progress
      DROP IF EXISTS progress,
      DROP IF EXISTS current_question,
      ADD COLUMN last_answered_question UUID REFERENCES questions(id),
      ADD COLUMN current_question UUID REFERENCES questions(id),
      ADD COLUMN answered_questions UUID[] DEFAULT '{}',
      ADD COLUMN current_question_no INT NOT NULL,
      ADD COLUMN progress_status TEXT CHECK (progress_status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
      ADD COLUMN completed_at TIMESTAMP DEFAULT NULL;
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
