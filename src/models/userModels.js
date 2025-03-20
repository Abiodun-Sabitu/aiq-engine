import db from "../config/db";

// user interactions with the db are encapsulated here

const userData = `SELECT id, email, username, avatar_url, role, badge_id, country, country_flag, 
created_at, updated_at, last_login, provider, provider_user_id FROM users WHERE email = $1 OR provider_user_id= $2`;

const SocialLoginUserData = `SELECT id, email, username, avatar_url, role, badge_id, country, country_flag, 
created_at, updated_at, last_login, provider, provider_user_id FROM users WHERE provider_user_id= $1`;

export const findUserByEmailOrID = async (email, providerId) => {
  const { rows } = await db.query(userData, [email, providerId]);
  return rows[0];
};

export const findUserBySocialLogin = async (providerId) => {
  const { rows } = await db.query(SocialLoginUserData, [providerId]);
  return rows[0];
};

export const createUserWithMagicLink = async (
  email,
  magicLinkToken,
  magicLinkExpiry
) => {
  const userPass = `INSERT INTO users (email, provider, magic_link_token, magic_link_expiry) VALUES ($1, 'local', $2, $3);`;
  await db.query(userPass, [email, magicLinkToken, magicLinkExpiry]);
};

export const setMagicLinkPass = async (
  email,
  magicLinkToken,
  magicLinkExpiry
) => {
  const query = `
    UPDATE users
    SET magic_link_token = $2, magic_link_expiry = $3
    WHERE email = $1
  `;
  await db.query(query, [email, magicLinkToken, magicLinkExpiry]);
};
