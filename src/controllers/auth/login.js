import pool from "../../config/db.js";

export const loginUser = async (req, res) => {
  try {
    //obtain userId from clerk auth
    console.log("pre req.auth:", req.auth);
    console.log("Headers:", req.headers);

    const { userId } = req.auth;
    console.log("post req.auth:", req.auth);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Check if user exists in our DB
    const queriedUser = await pool.query(
      `SELECT username, email, avatar_url, role, badge_id, country, country_flag, created_at FROM users WHERE clerk_user_id, = $1`,
      [userId]
    );

    if (queriedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    //Return user details
    const user = queriedUser.rows[0];
    res.status(200).json({ message: "Login successful!", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
