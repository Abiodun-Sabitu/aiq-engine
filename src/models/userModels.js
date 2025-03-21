import db from "../config/db.js";

// user interactions with the db are encapsulated here

export const findUserByEmail = async (email) => {
  const { rows } = await db.query(
    `SELECT email, magic_link_token, magic_link_expiry FROM users WHERE email = $1`,
    [email]
  );
  return rows[0];
};

export const findUserByProviderID = async (providerId) => {
  const { rows } = await db.query(
    `SELECT provider_user_id FROM users WHERE provider_user_id = $1`,
    [providerId]
  );
  return rows[0];
};

export const getAndSaveUserGoogleData = async (
  username,
  email,
  provider,
  id,
  picture
) => {
  const data = `INSERT INTO users(username, email, provider, provider_user_id, avatar_url) VALUES ($1, $2,'google' $4, $5)`;
  await db.query(data, [username, email, provider, id, picture]);
};

export const createUserWithMagicLink = async (
  email,
  magicLinkToken,
  magicLinkExpiry
) => {
  const userPass = `INSERT INTO users (email, provider, magic_link_token, magic_link_expiry) VALUES ($1, 'local', $2, $3);`;
  await db.query(userPass, [email, magicLinkToken, magicLinkExpiry]);
};

export const updateMagicLinkTokenAndExpiry = async (
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

export const updateLastLogin = async (email) => {
  await db.query(`UPDATE users SET last_login = NOW() WHERE email = $1`, [
    email,
  ]);
};

export const getUserDetails = async (email) => {
  const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);

  if (!rows[0]) return null;

  // Exclude magic_link_token and magic_link_expiry before returning
  const { magic_link_token, magic_link_expiry, ...userDetails } = rows[0];
  return userDetails;
};
