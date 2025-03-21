import passport from "passport";
import {
  findUserByProviderID,
  getUserDetails,
  updateLastLogin,
} from "../../models/userModels.js";
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
        console.log("kkkk", email);
        //Check if user already exists in database
        const existingUser = await findUserByProviderID(id);

        if (!existingUser) {
          await getAndSaveUserGoogleData(
            username,
            email,
            "google",
            id,
            picture
          );
        }

        await updateLastLogin(email);
        const userDetails = await getUserDetails(email);

        // Generate JWT access and refresh tokens
        const { accessToken, refreshToken } = generateTokens(userDetails);

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

        return res
          .status(200)
          .json({ message: "Login successful", user: userDetails });
      } catch (dbError) {
        return res.status(500).json({
          message: "Database error",
          error: dbError?.message || dbError,
        });
      }
    }
  )(req, res, next); // Execute Passport authentication
};
