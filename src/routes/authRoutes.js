import express from "express";
import dotenv from "dotenv";
import { magicLink } from "../controllers/auth/magicLink.js";

dotenv.config();

const router = express.Router();

router.post("/magic-link", magicLink);

export default router;
