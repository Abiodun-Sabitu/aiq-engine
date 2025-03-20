import passport from "passport";
import db from "../../config/db.js";
import { generateTokens } from "../../helpers/generateToken.js";

// Google OAuth Login
export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"], // Request Google profile and email
  session: false,
});

// Google OAuth Callback
export const googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    async (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({ message: "Authentication failed" }); // Handle authentication failure
      }
      console.log({ user: user });
      try {
        // const { id, displayName, emails } = user; // Extract user data from Google profile
        const googleUser = user?._json;
        const { sub: id, given_name: username, email, picture } = googleUser;

        // Check if user already exists in database
        const { rows } = await db.query(
          "SELECT * FROM users WHERE provider_user_id = $1",
          [id]
        );

        let dbUser;
        if (rows.length > 0) {
          dbUser = rows[0]; // User exists, retrieve user details
        } else {
          // User does not exist, create a new user in database
          const newUser = await db.query(
            "INSERT INTO users (username, email, provider, provider_user_id, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, "google", id, picture]
          );
          dbUser = newUser.rows[0]; // Retrieve newly created user details
        }

        // Generate JWT access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(dbUser);

        // Store access token in HttpOnly cookie
        res.cookie("auth_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict", // Prevent CSRF attacks
          maxAge: 30 * 60 * 1000, // Expiry: 30 minutes
        });

        // Store refresh token in HttpOnly cookie
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 3 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ message: "Login successful", dbUser });
      } catch (dbError) {
        return res
          .status(500)
          .json({ message: "Database error", error: dbError });
      }
    }
  )(req, res, next); // Execute Passport authentication
};
