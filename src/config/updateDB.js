import dotenv from "dotenv";
import pg from "pg";

dotenv.config();
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure your DB connection is set in .env
});

// 🛠️ Function to update the database schema
const updateDatabase = async () => {
  try {
    console.log("⏳ Applying users table updates...");

    await db.query("BEGIN"); // Start transaction

    // 2️⃣ Add new columns (if they don't exist)
    await db.query(`
   
      ALTER TABLE users DROP COLUMN IF EXISTS jwt_token;

    `);

    await db.query("COMMIT"); // Apply changes

    console.log("✅ Users table updated successfully!");
  } catch (error) {
    await db.query("ROLLBACK"); // Undo changes on error
    console.error("❌ Error updating users table:", error);
  } finally {
    await db.end(); // Close DB connection
  }
};

// Run the migration
updateDatabase();
