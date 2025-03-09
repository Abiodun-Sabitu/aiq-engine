import db from "../../config/db.js";
import crypto from "crypto";
import { sendMail } from "../../services/emailService.js";
import dotenv from "dotenv";
import { magicLinkEmail } from "../../mails/magicLinkEmail.js";

dotenv.config();

export const magicLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    const { rows: existingUsers } = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    let userMailBox;
    let subject;
    let content;

    // Generate magic link token and expiry
    const magicLinkToken = crypto.randomBytes(16).toString("hex");
    const magicLinkExpiry = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes from now

    if (existingUsers.length === 0) {
      // Create new user
      await db.query(
        "INSERT INTO users (email, provider, magic_link_token, magic_link_expiry) VALUES ($1, 'local', $2, $3)",
        [email, magicLinkToken, magicLinkExpiry]
      );
      userMailBox = email;
      subject = "🎉 Almost there! Your AIQ login is just one click away";
      content = magicLinkEmail(
        `${process.env.BASE_URL}/auth/magic-login?email=${encodeURIComponent(
          email
        )}&token=${encodeURIComponent(magicLinkToken)}`
      );

      sendMail(userMailBox, content, subject);
      return res.status(201).json({ message: "Account successfully created!" });
    }

    // Update existing user with new magic link token and expiry
    await db.query(
      "UPDATE users SET magic_link_token = $1, magic_link_expiry = $2 WHERE email = $3",
      [magicLinkToken, magicLinkExpiry, email]
    );

    // Send magic link email
    userMailBox = email;
    subject = "Your AIQ magic login link";
    content = magicLinkEmail(
      `${process.env.BASE_URL}/auth/magic-login?email=${encodeURIComponent(
        email
      )}&token=${encodeURIComponent(magicLinkToken)}`
    );
    sendMail(userMailBox, content, subject);

    res.status(200).json({ message: "Magic link has been sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
