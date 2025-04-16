import { fetchQuestions } from "../../services/quiz/quizServices.js";

export const getQuestions = async (req, res) => {
  const { userId } = req.params;
  const { quizId } = req.query;

  try {
    const fetchedQuestions = await fetchQuestions(quizId, userId);
    return res.status(200).json({
      message: "Questions fetched successfully",
      data: fetchedQuestions,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error fetching questions", error: err });
  }
};
