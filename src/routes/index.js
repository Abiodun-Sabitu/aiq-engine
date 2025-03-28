import express from "express";
import authRoutes from "./authRoutes.js";
import { updateUserProfile } from "../controllers/profile/updateUserProfile.js";
import { authenticateUser } from "../middleware/authenticateUser.js";
import { logout } from "../controllers/logout.js";
import { validateProfile } from "../middleware/validations/validators.js";
import { getAllBadges } from "../controllers/badges/getAllBadges.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.post("/logout", logout);
router.patch(
  "/update-user-profile",
  authenticateUser,
  validateProfile,
  updateUserProfile
);
router.get("/get-all-badges", authenticateUser, getAllBadges);

export default router;
