import { updateProfile, getUserDetails } from "../../models/user/onboarding.js";

export const updateUserProfile = async (req, res) => {
  const { email, ...profileData } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required for this operation" });
  }
  try {
    await updateProfile(email, profileData);
    const userDetails = await getUserDetails(email);
    return res
      .status(200)
      .json({ message: "profile updated successfully", user: userDetails });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
