import { getUserRole } from "../../services/user/onboarding.js";

export const isAdmin = async (req, res, next) => {
  const { email } = req.user;
  const userRole = await getUserRole(email);
  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: You do not have admin privileges.",
    });
  }
  next();
};
