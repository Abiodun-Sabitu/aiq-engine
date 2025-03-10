import db from "../../config/db.js";
import { generateTokens } from "../../helpers/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

export const validateMagicLink = async (req, res) => {
  const { email, token } = req.query;

  console.log(email, token);

  if (!email || !token) {
    return res.status(400).json({ message: "Email and token are required" });
  }

  try {
    // Find the user by email
    const { rows: users } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    // Validate the magic link token
    if (!user.magic_link_token || user.magic_link_token !== token) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const currentTime = Date.now();
    if (user.magic_link_expiry < currentTime) {
      return res.status(400).json({ message: "Token has expired" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    // Store access token token in httpOnly cookie
    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000, // 30 min
    });
    // Store refresh token in httpOnly cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });
    console.log("refreshToken", refreshToken);
    const lastLoginDate = new Date(Date.now());
    await db.query(`UPDATE users SET last_login=$1 WHERE email=$2`, [
      lastLoginDate,
      email,
    ]);

    res.status(200).json({ message: "Authentication successful", user });
  } catch (err) {
    console.error("Error during magic link validation:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
