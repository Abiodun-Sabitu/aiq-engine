import {
  fetchQuestions,
  isValidQuizId,
} from "../../services/quiz/questionServices.js";
import { findUserByID } from "../../services/user/onboarding.js";

export const getQuestions = async (req, res) => {
  const { userId } = req.params;
  const { quizId } = req.query;

  if (!userId || !quizId) {
    return res.status(400).json({ message: "one of user or quiz id is null" });
  }

  const isExistingUser = await findUserByID(userId);
  const correctQuizId = await isValidQuizId(quizId);
  if (!isExistingUser || !correctQuizId) {
    return res
      .status(400)
      .json({ message: "unknown user or quiz id detected" });
  }

  try {
    const fetchedQuestions = await fetchQuestions(quizId, userId);
    return res.status(200).json({
      message: "Questions fetched successfully",
      data: fetchedQuestions,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching questions" });
  }
};
