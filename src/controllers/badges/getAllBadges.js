import { fetchAllBadges } from "../../services/badges/badgeServices.js";

export const getAllBadges = async (_, res) => {
  try {
    const allBadges = await fetchAllBadges();
    return res.status(200).json({ message: "", data: allBadges });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error fetching badges", error: err });
  }
};
