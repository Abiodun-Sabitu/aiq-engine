import pool from "./db.js";
import dotenv from "dotenv";

dotenv.config();

// 🛠️ Function to apply database updates
const updateDatabase = async () => {
  try {
    console.log("⏳ Updating users table...");

    // Make username optional
    await pool.query(`
      ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
    `);

    console.log("✅ Users table updated successfully!");
  } catch (error) {
    console.error("❌ Error updating users table:", error);
  } finally {
    await pool.end();
  }
};

// Run the script
updateDatabase();
