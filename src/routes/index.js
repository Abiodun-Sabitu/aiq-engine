import express from "express";
import authRoutes from "./authRoutes.js";
import { updateUserProfile } from "../controllers/profile/updateUserProfile.js";
import { authenticateUser } from "../middleware/user/authenticateUser.js";
import { logout } from "../controllers/logout.js";
import { validateProfile } from "../middleware/validations/validators.js";
import { getAllBadges } from "../controllers/badges/getAllBadges.js";
import { getBadgeById } from "../controllers/badges/getBadgeById.js";
import { editBadgeDetails } from "../controllers/badges/editBadgeDetails.js";
import { isAdmin } from "../middleware/admin/isAdmin.js";
import { getQuestions } from "../controllers/quiz/getQuestions.js";
import { validateUserAndQuizID } from "../middleware/quiz/validateUserAndQuizId.js";
import { startQuiz } from "../controllers/quiz/startQuiz.js";

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
router.get("/get-badge/:badgeId", authenticateUser, getBadgeById);
router.post("/admin/edit-badge", authenticateUser, isAdmin, editBadgeDetails);
router.post(
  "/start-quiz/:userId",
  authenticateUser,
  validateUserAndQuizID,
  startQuiz
);
router.get(
  "/get-quiz-questions/:userId",
  authenticateUser,
  validateUserAndQuizID,
  getQuestions
);

export default router;
