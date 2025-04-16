import db from "../../config/db.js";

export const findQuizByID = async (id) => {
  const { rows } = await db.query(`SELECT id from quizzes WHERE id=$1`, [id]);
  return rows.length > 0;
};

export const initUserProgress = async (userId, quizId, difficulty) => {
  const startedAt = new Date();
  const currentQuestionNo = 0;

  const startProgressQuery = `
    INSERT INTO user_progress (user_id, quiz_id, current_question_no)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, quiz_id, current_question_no;
  `;

  const logAttemptQuery = `
    INSERT INTO attempts_log (
      user_id,
      quiz_id,
      difficulty,
      started_at,
      attempt_number
    )
    VALUES (
      $1,
      $2,
      $3,
      $4,
      COALESCE(
        (SELECT COUNT(*) + 1 FROM attempts_log WHERE user_id = $1 AND quiz_id = $2),
        1
      )
    )
    RETURNING started_at;
  `;

  // Insert into user_progress table
  const progressResult = await db.query(startProgressQuery, [
    userId,
    quizId,
    currentQuestionNo,
  ]);

  if (progressResult.rows.length === 0) {
    throw new Error(
      "Failed to initialize user progress. No rows returned from user_progress insert."
    );
  }

  // Insert into attempts_log table
  const logResult = await db.query(logAttemptQuery, [
    userId,
    quizId,
    difficulty,
    startedAt,
  ]);

  if (logResult.rows.length === 0) {
    throw new Error(
      "Failed to log attempt. No rows returned from attempts_log insert."
    );
  }

  return {
    ...progressResult.rows[0],
    started_at: logResult.rows[0].started_at,
  };
};

export const getProgressStatus = async (userId, quizId) => {
  const { rows } = await db.query(
    `SELECT progress_status FROM user_progress WHERE user_id = $1 AND quiz_id = $2`,
    [userId, quizId]
  );
  return rows[0]?.progress_status || null;
};

export const fetchQuestions = async (quizId, userId, perPage = 10) => {
  const query = `
    SELECT id, question_text, options
    FROM questions
    WHERE quiz_id = $1
      AND id NOT IN (
        SELECT UNNEST(answered_questions)
        FROM user_progress
        WHERE user_id = $2 AND quiz_id = $1
      )
    ORDER BY RANDOM()
    LIMIT $3;
  `;

  try {
    const result = await db.query(query, [quizId, userId, perPage]);
    return result.rows.map((row) => ({
      id: row.id,
      question_text: row.question_text,
      options: row.options,
    }));
  } catch (err) {
    console.error("Error fetching questions:", err);
    throw new Error("Error fetching questions.");
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

//   CREATE TABLE user_scores (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
//     score INT DEFAULT 0 NOT NULL,
//     correctly_answered INT DEFAULT 0 NOT NULL,
//     incorrectly_answered INT DEFAULT 0 NOT NULL
//   );
// `);

//when validating each answer submitted by a quiz taker, we need to do the following
// update last answered question, current question no, answered question array on the user progress table
// check quiz table if the option submitted is the correct_option.
// if it is, update the score on the user_scores table, and increment correctly_answered, and return the equivalent, question id, quiz_id and fun_fact to the frontend
// if it is not, increment incorrectly_answered on the user_scores table, and return the equivalent question id, quiz_id and fun_fact to the frontend
// if the quiz is completed we will need to do the following:
//  update the progress_status to completed on the user_progress table,
//  update completion time on the attempts_log table,
//  get score from score table and also update it into previous_score in attempts_log table,
//

// export const initUserProgress = async (userId, quizId, difficulty) => {
//   const startedAt = new Date();
//   const currentQuestionNo = 0;

//   // ✅ Check for existing progress
//   const existingProgressResult = await db.query(
//     `SELECT * FROM user_progress WHERE user_id = $1`,
//     [userId]
//   );

//   const existingProgress = existingProgressResult.rows[0];

//   if (existingProgress?.progress_status === "in_progress") {
//     throw new Error("You already have a running quiz.");
//   }

//   let progressResult;

//   if (existingProgress) {
//     // ✅ Update existing progress
//     const updateQuery = `
//       UPDATE user_progress
//       SET quiz_id = $1,
//           current_question_no = $2,
//           answered_questions = '{}',
//           last_answered_question = NULL,
//           current_question = NULL,
//           progress_status = 'in_progress'
//       WHERE user_id = $3
//       RETURNING id, user_id, quiz_id, current_question_no;
//     `;

//     progressResult = await db.query(updateQuery, [
//       quizId,
//       currentQuestionNo,
//       userId,
//     ]);
//   } else {
//     // ✅ Insert new progress
//     const insertQuery = `
//       INSERT INTO user_progress (user_id, quiz_id, current_question_no)
//       VALUES ($1, $2, $3)
//       RETURNING id, user_id, quiz_id, current_question_no;
//     `;

//     progressResult = await db.query(insertQuery, [
//       userId,
//       quizId,
//       currentQuestionNo,
//     ]);
//   }

//   if (progressResult.rows.length === 0) {
//     throw new Error(
//       "Failed to initialize user progress. No rows returned from user_progress."
//     );
//   }

//   // ✅ Check existing attempts count
//   const { rows: existingAttempts } = await db.query(
//     `SELECT id FROM attempts_log WHERE user_id = $1 AND quiz_id = $2 ORDER BY started_at ASC`,
//     [userId, quizId]
//   );

//   if (existingAttempts.length >= 5) {
//     // ✅ Update oldest attempt
//     const oldestAttemptId = existingAttempts[0].id;

//     await db.query(
//       `
//       UPDATE attempts_log
//       SET difficulty = $1,
//           started_at = $2
//       WHERE id = $3
//     `,
//       [difficulty, startedAt, oldestAttemptId]
//     );
//   } else {
//     // ✅ Insert new attempt
//     await db.query(
//       `
//       INSERT INTO attempts_log (
//         user_id,
//         quiz_id,
//         difficulty,
//         started_at,
//         attempt_number
//       )
//       VALUES (
//         $1,
//         $2,
//         $3,
//         $4,
//         COALESCE(
//           (SELECT COUNT(*) + 1 FROM attempts_log WHERE user_id = $1 AND quiz_id = $2),
//           1
//         )
//       )
//     `,
//       [userId, quizId, difficulty, startedAt]
//     );
//   }

//   // ✅ Return response
//   return {
//     ...progressResult.rows[0],
//     started_at: startedAt,
//   };
// };
