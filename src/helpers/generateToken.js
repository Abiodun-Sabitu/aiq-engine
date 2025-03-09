import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { email: user.email, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "30m" } // Short-lived token
  );

  const refreshToken = jwt.sign(
    { email: user.email, id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: "3d" } // Long-lived token
  );

  return { accessToken, refreshToken };
};
