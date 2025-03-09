import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(userMailBox, content, subject) {
  console.log("userMailBox is", userMailBox);
  const mailOptions = {
    from: `"Magic Link from AIQ" ${process.env.SMTP_USER}`,
    to: userMailBox,
    subject: subject,
    html: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", userMailBox);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}
