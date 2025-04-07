import { editBadge } from "../../services/badges/badgeServices.js";

export const editBadgeDetails = async (req, res) => {
  const { email } = req.user;

  const { id, name, criteria, image_url } = req.body;
  if (!id || !name || !criteria || !image_url) {
    return res.status(400).json({ message: "incorrect or missing data" });
  }
  try {
    const updatedBadge = await editBadge({ id, name, criteria, image_url });
    res
      .status(200)
      .json({ message: "Badge updated successfully", data: updatedBadge });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update badge", error: error.message });
  }
};
