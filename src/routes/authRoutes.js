import express from "express";
import { registerUser } from "../controllers/auth/register.js";
import { loginUser } from "../controllers/auth/login.js";
import { requireAuth } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
router.post("/register", registerUser);
router.post(
  "/login",
  requireAuth({
    onError: (err, req, res) => {
      console.error("❌ Clerk Auth Error:", err);
      return res.status(401).json({ error: "Unauthorized" });
    },
  }),
  loginUser
);

export default router;
