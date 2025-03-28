import express from "express";
import dotenv from "dotenv";
import { magicLink } from "../controllers/auth/magicLink.js";
import { validateMagicLink } from "../controllers/auth/validateMagicLink.js";
import { googleLogin, googleCallback } from "../controllers/auth/googleAuth.js";
import {
  facebookLogin,
  facebookCallback,
} from "../controllers/auth/facebookAuth.js";

import {
  twitterLogin,
  twitterCallback,
} from "../controllers/auth/twitterAuth.js";
import { validateEmail } from "../middleware/validations/validators.js";

dotenv.config();

const router = express.Router();

router.post("/magic-link", validateEmail, magicLink);
router.get("/validate-magic-link", validateMagicLink);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/facebook", facebookLogin);
router.get("/facebook/callback", facebookCallback);
router.get("/twitter", twitterLogin);
router.get("/twitter/callback", twitterCallback);

export default router;
