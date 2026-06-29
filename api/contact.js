// Contact endpoints for email and SMS verification
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
// For SMS, you would use a provider like Twilio (stubbed here)

// Configure your email transport (use environment variables in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL_USER,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

router.post("/api/contact/email", async (req, res) => {
  const { email, node } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });
  try {
    await transporter.sendMail({
      from: "noreply@iopic.world",
      to: email,
      subject: "Iopic Node Verification",
      text: `Hello from Iopic! Node: ${node || "Anonymous"}`,
    });
    res.json({ status: "sent" });
  } catch (e) {
    res.status(500).json({ error: "Failed to send email" });
  }
});

router.post("/api/contact/sms", async (req, res) => {
  const { phone, node } = req.body;
  if (!phone) return res.status(400).json({ error: "Missing phone" });
  // TODO: Integrate with SMS provider (e.g., Twilio)
  // Simulate SMS sent
  setTimeout(() => {
    res.json({ status: "sent" });
  }, 500);
});

module.exports = router;
