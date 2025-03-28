import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const createTables = async () => {
  try {
    console.log("⏳ Initializing database...");

    // Create badges first
    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT UNIQUE NOT NULL,
        criteria TEXT NOT NULL,
        image_url TEXT DEFAULT 'https://example.com/badge-placeholder.png',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default badges after creating badges table
    await db.query(`
      INSERT INTO badges (id, name, criteria, image_url) VALUES
        (gen_random_uuid(), 'Rookie', 'Default badge for new users', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'Explorer', 'Completed the first quiz', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'Thinker', 'Answered 10 questions correctly', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'Strategist', 'Achieved 70% accuracy in Intermediate-level quizzes', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'Innovator', 'Scored in the top 10% of the leaderboard', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'AI Guru', 'Successfully completed multiple Advanced-level quizzes', 'https://example.com/badge-placeholder.png'),
        (gen_random_uuid(), 'Mastermind', 'Consistently ranks in the top leaderboard for a month', 'https://example.com/badge-placeholder.png')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Create users AFTER badges
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE DEFAULT NULL,
      avatar_url TEXT DEFAULT NULL,
      role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
      badge_id UUID DEFAULT (SELECT id FROM badges WHERE name = 'Rookie') REFERENCES badges(id),
      country TEXT DEFAULT NULL,
      country_flag TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP DEFAULT NULL,
      provider TEXT CHECK (provider IN ('google', 'facebook', 'twitter')) DEFAULT 'local',
      provider_user_id TEXT DEFAULT NULL,
      jwt_token TEXT DEFAULT NULL,  -- Store JWT for session management
      magic_link_token TEXT DEFAULT NULL,  -- Store token for magic link authentication
      magic_link_expiry TIMESTAMP DEFAULT NULL  -- Token expiration time
    );

   `);

    // Other tables remain unchanged
    await db.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        description TEXT NOT NULL,
        time_limit INT DEFAULT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_option INT NOT NULL,
        difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        fun_fact TEXT NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        current_question INT NOT NULL,
        progress JSONB NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        score INT NOT NULL,
        attempt_number INT NOT NULL,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS attempts_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
        previous_score INT NOT NULL,
        attempt_number INT NOT NULL,
        difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
        attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        aiq_score FLOAT NOT NULL DEFAULT 0,
        rank INT NOT NULL DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Tables and default badges inserted successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    db.end();
  }
};

createTables();
