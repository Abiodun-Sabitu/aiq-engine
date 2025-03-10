import jwt from "jsonwebtoken";
import { generateTokens } from "../helpers/generateToken.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { auth_token, refresh_token } = req.cookies;
    console.log({ auth_token: auth_token, refresh_token: refresh_token });

    if (!auth_token) return res.status(401).json({ message: "Unauthorized" });

    // Verify access token
    jwt.verify(auth_token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
        return next();
      }

      if (err.name === "TokenExpiredError") {
        // If access token expired, check refresh token
        if (!refresh_token)
          return res
            .status(401)
            .json({ message: "Session expired. Please login again." });

        jwt.verify(
          refresh_token,
          process.env.REFRESH_SECRET,
          (refreshErr, refreshDecoded) => {
            if (refreshErr)
              return res.status(403).json({ message: "Invalid refresh token" });

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

            req.user = jwt.verify(accessToken, process.env.JWT_SECRET);
            return next();
          }
        );
      } else {
        return res.status(403).json({ message: "Invalid token" });
      }
    });
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
