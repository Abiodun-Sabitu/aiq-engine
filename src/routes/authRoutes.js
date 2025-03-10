import express from "express";
import dotenv from "dotenv";
import { magicLink } from "../controllers/auth/magicLink.js";
import { validateMagicLink } from "../controllers/auth/validateMagicLink.js";
// import { authenticateUser } from "../middleware/authenticateUser.js";

dotenv.config();

const router = express.Router();

router.post("/magic-link", magicLink);
router.get("/validate-magic-link", validateMagicLink);

export default router;
