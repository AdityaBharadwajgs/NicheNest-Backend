const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Send OTP Email
const sendOtp = async (mail, otp) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: mail, // IMPORTANT: keep as string
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

    console.log("📩 Resend Response:", response);

    // Check if email was actually accepted
    if (!response || response.error) {
      console.error("❌ Resend failed:", response?.error);
      return false;
    }

    console.log("✅ OTP sent successfully to:", mail);
    return true;

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    return false;
  }
};

// ✅ Send General Email
const sendEmail = async (mail, subject, message) => {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: mail,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    console.log("📩 Resend Response:", response);

    if (!response || response.error) {
      console.error("❌ Resend failed:", response?.error);
      return false;
    }

    console.log("✅ Email sent successfully to:", mail);
    return true;

  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

module.exports = { sendOtp, sendEmail };