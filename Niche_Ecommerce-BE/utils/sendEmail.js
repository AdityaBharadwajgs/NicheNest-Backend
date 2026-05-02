const nodemailer = require("nodemailer");

// ✅ Use secure SMTP (port 465) for better reliability on Render
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 465,
  secure: true, // IMPORTANT: true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 15000, // 15 sec
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// ✅ Send OTP Email
const sendOtp = async (mail, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"NicheNest" <${process.env.SMTP_USER}>`,
      to: mail,
      subject: "OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: green;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};

// ✅ Send General Email
const sendEmail = async (mail, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"NicheNest" <${process.env.SMTP_USER}>`,
      to: mail,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Email error:", error);
    return false;
  }
};

module.exports = { sendOtp, sendEmail };