import passport from "passport";
import {
  findUserByProviderID,
  getAndSaveUserTwitterData,
  getUserDetails,
  updateLastLogin,
} from "../../models/user/onboarding.js";
import { generateTokens } from "../../helpers/generateToken.js";

// Twitter OAuth Login
export const twitterLogin = passport.authenticate("twitter", {
  session: true, // Enable session for OAuth
});

// Twitter OAuth Callback
export const twitterCallback = (req, res, next) => {
  passport.authenticate("twitter", async (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: "Authentication failed" });
    }
    try {
      const twitterUser = user._json;
      const {
        id_str: id,
        name: username,
        email,
        profile_image_url_https: picture,
      } = twitterUser;

      // Check if user already exists
      let existingUser = await findUserByProviderID(id);
      if (!existingUser) {
        await getAndSaveUserTwitterData(
          username,
          email,
          "twitter",
          id,
          picture
        );
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

        // Generate JWT tokens
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
        error: dbError.message || dbError,
      });
    }
  })(req, res, next);
};
