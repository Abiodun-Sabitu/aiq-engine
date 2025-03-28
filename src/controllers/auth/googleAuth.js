import passport from "passport";
import {
  findUserByProviderID,
  getAndSaveUserGoogleData,
  getUserDetails,
  updateLastLogin,
} from "../../services/user/onboarding.js";
import { generateTokens } from "../../helpers/generateToken.js";

// Google OAuth Login
export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"], // Request Google profile and email
  session: true, // Enable session for OAuth
});

// Google OAuth Callback
export const googleCallback = (req, res, next) => {
  passport.authenticate("google", async (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: "Authentication failed" });
    }

    try {
      // Extract user data from Google profile
      const googleUser = user?._json;
      const { sub: id, given_name: username, email, picture } = googleUser;

      // Check if user exists in database
      let existingUser = await findUserByProviderID(id);
      if (!existingUser) {
        await getAndSaveUserGoogleData(username, email, "google", id, picture);
      }

      await updateLastLogin(email);
      const userDetails = await getUserDetails(email);

      // **Persist the user in session temporarily before issuing JWT**
      req.login(userDetails, { session: true }, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ message: "Session error", error: loginErr });
        }

        // Generate JWT access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(userDetails);

        // Store access token in HttpOnly cookie
        res.cookie("auth_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 30 * 60 * 1000, // 30 minutes
        });

        // Store refresh token in HttpOnly cookie
        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        // Destroy session after authentication is complete (optional)
        req.session.destroy(() => {
          res
            .status(200)
            .json({ message: "Login successful", user: userDetails });
        });
      });
    } catch (dbError) {
      return res.status(500).json({
        message: "Database error",
        error: dbError?.message || dbError,
      });
    }
  })(req, res, next);
};
