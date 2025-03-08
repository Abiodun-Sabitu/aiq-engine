import pool from "../../config/db.js";

export const registerUser = async (req, res) => {
  try {
    console.log("hi", { req: req.body });
    const { userId, email } = req.body; // obtain these from clerk
    if (!userId || !email) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Check if user already exists in DB
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE clerk_user_id = $1`,
      [userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(200).json({ message: "Account already exits." });
    }

    await pool.query(
      `INSERT INTO users (clerk_user_id, email) VALUES ($1, $2)`,
      [userId, email]
    ),
      res.status(201).json({ success: "Account created successfully!" });
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
