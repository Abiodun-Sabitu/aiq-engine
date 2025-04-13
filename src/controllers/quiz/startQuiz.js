import {
  getProgressStatus,
  initUserProgress,
} from "../../services/quiz/questionServices.js";

export const startQuiz = async (req, res) => {
  const { userId } = req.params;
  const { quizId, difficulty } = req.query;
  try {
    const progressStatus = await getProgressStatus(userId, quizId);
    if (progressStatus === "in_progress") {
      return res
        .status(400)
        .json({ message: "You already have a running quiz" });
    }
    const userProgress = await initUserProgress(userId, quizId, difficulty);
    return res.status(200).json({
      message: "Quiz started successfully",
      data: userProgress,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error starting quiz", error: err });
  }
};
