import express from "express";
import dotenv from "dotenv";
import { magicLink } from "../controllers/auth/magicLink.js";
import { validateMagicLink } from "../controllers/auth/validateMagicLink.js";
import { googleLogin, googleCallback } from "../controllers/auth/googleAuth.js";

dotenv.config();

const router = express.Router();

router.post("/magic-link", magicLink);
router.get("/validate-magic-link", validateMagicLink);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

export default router;
