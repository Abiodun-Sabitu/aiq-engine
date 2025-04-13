import db from "../../config/db.js";

export const findQuizByID = async (id) => {
  const { rows } = await db.query(`SELECT id from quizzes WHERE id=$1`, [id]);
  return rows.length > 0;
};

export const initUserProgress = async (userId, quizId) => {
  const startedAt = new Date();
  const currentQuestionNo = 0;
  const initData = `INSERT INTO user_progress (user_id, quiz_id, started_at, current_question_no) VALUES ($1, $2, $3, $4) RETURNING id, user_id, quiz_id, current_question_no, started_at`;
  const { rows } = await db.query(initData, [
    userId,
    quizId,
    startedAt,
    currentQuestionNo,
  ]);
  if (rows.length > 0) {
    return rows[0];
  } else {
    throw new Error("failed to initialize user progress");
  }
};

export const fetchQuestions = async (
  quizId,
  userId,
  page = 1,
  perPage = 10
) => {
  // Calculate how many questions to skip based on the current page
  const offset = (parseInt(page, 10) - 1) * perPage;

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

// CREATE TABLE IF NOT EXISTS user_progress (
//         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//         quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
//         last_answered_question UUID REFERENCES questions(id),
//         current_question UUID REFERENCES questions(id),
//         answered_questions UUID[] DEFAULT '{}',
//         current_question_no INT NOT NULL,
//         progress_status TEXT CHECK (progress_status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
//         started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP DEFAULT NULL
//     );

//when user submits an answer, we need to do the following
// 1. submit user selected option, question Id, userId, quizId to the backend
// 2. backend will then update the following in user_progress table
// answered question array id of answered question, last_answered_question, current_question_no, userId, quiz_id,

// 3. then backend validates the answer submitted for correctness and return a feedback that consists of fun_fact, correct/incorrect,
