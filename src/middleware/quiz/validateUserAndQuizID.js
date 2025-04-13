import { findUserByID } from "../../services/user/onboarding.js";
import { findQuizByID } from "../../services/quiz/questionServices.js";

export const validateUserAndQuizID = async (req, res, next) => {
  const { userId } = req.params;
  const { quizId } = req.query;

  if (!userId || !quizId) {
    return res.status(400).json({ message: "User ID or Quiz ID is missing." });
  }

  try {
    const user = await findUserByID(userId);
    const quiz = await findQuizByID(quizId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found." });
    }

    // // Optionally attach found user/quiz to req for use in controllers
    // req.user = user;
    // req.quiz = quiz;

    next(); // Continue to the controller
  } catch (error) {
    console.error("Validation error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err });
  }
};
