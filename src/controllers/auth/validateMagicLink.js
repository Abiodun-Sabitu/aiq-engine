import {
  findUserByEmail,
  getUserDetails,
  updateLastLogin,
} from "../../services/user/onboarding.js";
import { generateTokens } from "../../helpers/generateToken.js";

export const validateMagicLink = async (req, res) => {
  const { email, token } = req.query;

  if (!email || !token) {
    return res.status(400).json({ message: "Email and auth are required" });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the magic link token and expiry in a single check
    if (
      user.magic_link_token !== token ||
      new Date(user.magic_link_expiry).getTime() < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired magic link" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store tokens in HTTP-only cookies
    res.cookie("auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      // maxAge: 30 * 60 * 1000, // 30 minutes
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    });

    // console.log("Set-Cookie Headers:", res.getHeaders()["set-cookie"]);

    // Update last login timestamp
    await updateLastLogin(email);

    // Retrieve user details without sensitive fields
    const userDetails = await getUserDetails(email);

    res
      .status(200)
      .json({ message: "Authentication successful", user: userDetails });
  } catch (err) {
    console.error("Error during magic link validation:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
