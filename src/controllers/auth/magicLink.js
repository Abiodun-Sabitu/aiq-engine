import crypto from "crypto";
import { sendMail } from "../../services/email/emailService.js";
import dotenv from "dotenv";
import { magicLinkEmail } from "../../services/email/magicLinkEmail.js";
import {
  findUserByEmail,
  createUserWithMagicLink,
  updateMagicLinkTokenAndExpiry,
} from "../../services/user/onboarding.js";

dotenv.config();

export const magicLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const existingUser = await findUserByEmail(email);
    //console.log({ existingUser: existingUser });

    // Generate magic link token and expiry
    const magicLinkToken = crypto.randomBytes(16).toString("hex");
    const magicLinkExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

    let userMailBox = email;
    let subject;
    let content = magicLinkEmail(
      `${process.env.BASE_URL}/api/auth/magic-login?email=${encodeURIComponent(
        email
      )}&token=${encodeURIComponent(magicLinkToken)}`
    );

    if (existingUser) {
      // Update existing user with new magic link token and expiry
      await updateMagicLinkTokenAndExpiry(
        email,
        magicLinkToken,
        magicLinkExpiry
      );
      subject = "Your AIQ magic login link";
      await sendMail(userMailBox, content, subject);
      return res.status(200).json({
        message: "Welcome back! Hit the magic link sent to your email to login",
      });
    } else {
      // Create new user
      await createUserWithMagicLink(email, magicLinkToken, magicLinkExpiry);
      subject = "🎉 Almost there! Your AIQ login is just one click away";
      await sendMail(userMailBox, content, subject);
      return res.status(201).json({
        message:
          "Boom! Account’s ready. Hit the magic link sent to your email to login",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
