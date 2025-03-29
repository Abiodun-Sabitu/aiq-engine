import db from "../../config/db.js";

export const fetchUserBadge = async (email, badgeId) => {
  // Fetch the user's badge ID
  const { rows } = await db.query(`SELECT badge_id FROM users WHERE email=$1`, [
    email,
  ]);

  if (rows.length === 0) {
    throw new Error("unable to fetch user badge: user record may be missing"); // Throw error instead of returning it
  }

  const userBadgeId = rows[0].badge_id;

  if (userBadgeId !== badgeId) {
    throw new Error("Invalid badge ID"); // Throw an error for invalid badge
  }

  // Fetch badge details if valid
  const badgeResult = await db.query(`SELECT * FROM badges WHERE id=$1`, [
    badgeId,
  ]);

  if (badgeResult.rows.length === 0) {
    throw new Error("Badge not found");
  }

  return badgeResult.rows[0];
};

export const fetchAllBadges = async () => {
  const { rows } = await db.query(
    `SELECT id, name, criteria, image_url FROM badges`
  );
  return rows;
};

export const editBadge = async ({ id, name, criteria, image_url }) => {
  // Check if badge exists
  const { rows: existingBadge } = await db.query(
    `SELECT id FROM badges WHERE id=$1`,
    [id]
  );
  if (existingBadge.length === 0) {
    throw new Error("Invalid badge ID");
  }

  // Update badge and return the updated row
  const { rows } = await db.query(
    `UPDATE badges SET name=$1, criteria=$2, image_url=$3 WHERE id=$4 RETURNING *`,
    [name, criteria, image_url, id]
  );

  if (rows.length === 0) {
    throw new Error("Badge update failed, no changes made");
  }

  return rows[0]; // Return updated badge
};
