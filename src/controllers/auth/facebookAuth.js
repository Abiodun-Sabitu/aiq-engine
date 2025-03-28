import passport from "passport";
import {
  findUserByProviderID,
  getAndSaveUserFacebookData,
  getUserDetails,
  updateLastLogin,
} from "../../models/user/onboarding.js";
import { generateTokens } from "../../helpers/generateToken.js";

// Facebook OAuth Login
export const facebookLogin = passport.authenticate("facebook", {
  scope: ["email"], // Request Facebook email
  session: true, // Enable session for OAuth
});

// Facebook OAuth Callback
export const facebookCallback = (req, res, next) => {
  passport.authenticate("facebook", async (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: "Authentication failed" });
    }
    console.log({ user });

    try {
      // Extract user data from Facebook profile
      const facebookUser = user?._json;
      const { id, name: username, email } = facebookUser;

      // If the Facebook account has no email, prevent login
      if (!email) {
        return res
          .status(400)
          .json({ message: "No email associated with this Facebook account" });
      }

      // Check if user exists
      let existingUser = await findUserByProviderID(id);
      if (!existingUser) {
        await getAndSaveUserFacebookData(username, email, "facebook", id);
      }

      await updateLastLogin(email);
      const userDetails = await getUserDetails(email);

      // **Persist the user in session before issuing JWT**
      req.login(userDetails, { session: true }, (loginErr) => {
        if (loginErr) {
          return res
            .status(500)
            .json({ message: "Session error", error: loginErr });
        }

        // Generate JWT access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(userDetails);

        // Store tokens in HttpOnly cookies
        res.cookie("auth_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 30 * 60 * 1000, // 30 minutes
        });

        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        // Destroy session after authentication to prevent interference with JWT
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
