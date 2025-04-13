import { initUserProgress } from "../../services/quiz/questionServices.js";

export const startQuiz = async (req, res) => {
  const { userId } = req.params;
  const { quizId } = req.query;
  try {
    const userProgress = await initUserProgress(userId, quizId);
    return res.status(200).json({
      message: "Quiz started successfully",
      data: userProgress,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error starting quiz", error: err });
  }
};
