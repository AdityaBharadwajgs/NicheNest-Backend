const Newsletter = require("../models/Newsletter");

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const exists = await Newsletter.findOne({ email });
    if (exists) {
      return res.status(200).json({ message: "You're already subscribed!" });
    }

    await Newsletter.create({ email });
    res.status(201).json({ message: "Subscription successful!" });
  } catch (err) {
    res.status(500).json({ message: "Subscription failed", error: err.message });
  }
};
