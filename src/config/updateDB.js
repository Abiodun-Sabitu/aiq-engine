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
      ALTER TABLE user_scores 
      ADD COLUMN correctly_answered INT NOT NULL,
      ADD COLUMN incorrectly_answered INT NOT NULL
    `);

    console.log("✅ user_scores table updated successfully!");
  } catch (error) {
    console.error("❌ Error updating user_scores  table:", error);
  } finally {
    await db.end();
  }
};

// Run the migration
updateDatabase();
