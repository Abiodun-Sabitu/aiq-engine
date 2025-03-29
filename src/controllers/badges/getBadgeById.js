import { fetchUserBadge } from "../../services/badges/badgeServices.js";

export const getBadgeById = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const email = req.user.email; // Get email from authenticated user
    console.log(badgeId);
    if (!email || !badgeId) {
      return res
        .status(400)
        .json({ message: "Email and badge ID are required" });
    }

    const userBadge = await fetchUserBadge(email, badgeId);

    if (!userBadge) {
      return res.status(404).json({ message: "Badge not found for this user" });
    }

    res
      .status(200)
      .json({ message: "Badge retrieved successfully", data: userBadge });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving badge", error: err.message });
  }
};
