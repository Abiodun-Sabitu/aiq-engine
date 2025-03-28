import express from "express";
import authRoutes from "./authRoutes.js";
import { updateUserProfile } from "../controllers/profile/updateUserProfile.js";
import { authenticateUser } from "../middleware/authenticateUser.js";
import { logout } from "../controllers/logout.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.post("/logout", logout);
router.patch("/update-user-profile", authenticateUser, updateUserProfile);

export default router;
