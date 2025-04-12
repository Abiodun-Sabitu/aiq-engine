import db from "../../config/db.js";

export const isValidQuizId = async (id) => {
  const { rows } = await db.query(`SELECT id from quizzes WHERE id=$1`, [id]);
  return rows.length > 0;
};

export const fetchQuestions = async (
  quizId,
  userId,
  page = 1,
  perPage = 10
) => {
  // Calculate how many questions to skip based on the current page
  const offset = (page - 1) * perPage;

  const data = `
    SELECT id, question_text, options, fun_fact
    FROM questions
    WHERE quiz_id = $1
      AND id NOT IN (
        SELECT UNNEST(answered_questions)
        FROM user_progress
        WHERE user_id = $2
      )
    ORDER BY RANDOM()
    LIMIT $3
    OFFSET $4;
  `;

  try {
    // Run the query
    const result = await db.query(data, [quizId, userId, perPage, offset]);
    if (result?.rows.length > 0) {
      return result.rows.map((row) => ({
        id: row.id,
        question_text: row.question_text,
        options: row.options,
      }));
    } else {
      return [];
    }
    // Return only selected fields: id, question_text, and options
  } catch (err) {
    console.error("Error fetching questions:", err);
    throw new Error("Error fetching questions:", err);
  }
};
