// 1. getQuestions(quizID)
// accept quiz id
//query the questions db and then return random 60 questions that match the provided quiz id
// return each with its own Id, question, options, and funcFacts
//

export const getQuestions = async (quizId, userId, page = 1, perPage = 10) => {
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

  // Run the query
  const result = await db.query(data, [quizId, userId, perPage, offset]);

  // Return only selected fields: id, question_text, and options
  return result.rows.map((row) => ({
    id: row.id,
    question_text: row.question_text,
    options: row.options,
  }));
};
