const { Resend } = require("resend");

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Send OTP Email
const sendOtp = async (mail, otp) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // default working sender
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

    console.log("✅ OTP sent successfully to:", mail);
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw new Error("Failed to send OTP email");
  }
};

// ✅ Send General Email
const sendEmail = async (mail, subject, message) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: mail,
      subject: subject,
      html: `<p>${message}</p>`,
    });

    console.log("✅ Email sent successfully to:", mail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendOtp, sendEmail };