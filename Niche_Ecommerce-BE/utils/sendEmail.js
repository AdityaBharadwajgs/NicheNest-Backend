const SibApiV3Sdk = require("sib-api-v3-sdk");

// ✅ Safety checks (VERY IMPORTANT)
if (!process.env.BREVO_API_KEY) {
  console.error("❌ Missing BREVO_API_KEY in environment variables");
}
if (!process.env.BREVO_SENDER_EMAIL) {
  console.error("❌ Missing BREVO_SENDER_EMAIL in environment variables");
}

// Configure Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY || "";

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ✅ Send OTP Email
const sendOtp = async (mail, otp) => {
  try {
    const response = await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "NicheNest",
      },
      to: [{ email: mail }],
      subject: "OTP Verification",
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1 style="color: green;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully");
    return true;

  } catch (error) {
    console.error(
      "❌ Email error:",
      error?.response?.body || error?.message || error
    );
    return false;
  }
};

// ✅ Send General Email
const sendEmail = async (mail, subject, message) => {
  try {
    const response = await tranEmailApi.sendTransacEmail({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: "NicheNest",
      },
      to: [{ email: mail }],
      subject: subject,
      htmlContent: `<p>${message}</p>`,
    });

    console.log("✅ Email sent successfully");
    return true;

  } catch (error) {
    console.error(
      "❌ Email error:",
      error?.response?.body || error?.message || error
    );
    return false;
  }
};

module.exports = { sendOtp, sendEmail };