import jwt from "jsonwebtoken";
import { generateTokens } from "../helpers/generateToken.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { auth_token, refresh_token } = req.cookies;

    if (!auth_token) return res.status(401).json({ message: "Unauthorized" });

    try {
      // Verify access token
      const decoded = await jwt.verify(auth_token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // If access token expired, check refresh token
        if (!refresh_token)
          return res
            .status(401)
            .json({ message: "Session expired. Please login again." });

        try {
          // Verify refresh token
          const refreshDecoded = await jwt.verify(
            refresh_token,
            process.env.REFRESH_SECRET
          );

          // Generate new access token
          const { accessToken } = generateTokens({
            email: refreshDecoded.email,
            id: refreshDecoded.id,
          });

          // Set new access token in cookie
          res.cookie("auth_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000, // 30 min
          });

          req.user = refreshDecoded;
          return next();
        } catch (refreshErr) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
