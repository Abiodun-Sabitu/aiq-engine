import express from "express";
import authRoutes from "./authRoutes.js";
// import userRoutes from "./userRoutes.js";
import { logout } from "../controllers/logout.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.post("/logout", logout);

export default router;
