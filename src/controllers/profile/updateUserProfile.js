import {
  updateProfile,
  getUserDetails,
  isAnExistingUser,
} from "../../services/user/onboarding.js";

export const updateUserProfile = async (req, res) => {
  const { email, ...profileData } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ message: "Email is required for this operation" });
  }
  try {
    const isValidUser = await isAnExistingUser(email);
    if (!isValidUser) {
      return res
        .status(403)
        .json({ message: "Access denied: You do not have permission" });
    }
    await updateProfile(email, profileData);
    const userDetails = await getUserDetails(email);
    return res
      .status(200)
      .json({ message: "profile updated successfully", data: userDetails });
  } catch (err) {
    console.error("Profile update error:", err);
    return res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};
