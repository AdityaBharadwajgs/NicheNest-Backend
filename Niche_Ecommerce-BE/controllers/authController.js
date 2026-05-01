const USERS = require('../models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtp } = require('../utils/sendEmail');

// 1. Register user (basic info only)
const userRegistration = async (req, res) => {
  const { fullName, email, mobileNumber, role } = req.body;

  try {
    const user = new USERS({ fullName, email, mobileNumber, role });
    const savedUser = await user.save();

    res.status(200).json({
      message: 'User registered successfully',
      registered_user: savedUser,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      if (err.keyValue?.mobileNumber) {
        return res.status(400).json({ message: 'This mobile number already exists' });
      }
      if (err.keyValue?.email) {
        return res.status(409).json({ message: 'This email already exists' });
      }
    }

    return res.status(500).json({ message: 'Server error while registering user' });
  }
};

// 2. Generate OTP and send via email
const generateOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await USERS.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    existingUser.otp = otp;
    existingUser.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await existingUser.save();

    await sendOtp(email, otp);
    return res.status(200).json({ message: 'OTP sent to your email', user: existingUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to generate/send OTP' });
  }
};

// 3. Verify OTP
const verifyOTP = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  try {
    const user = await USERS.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

// 4. Create password after OTP
const createPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const user = await USERS.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    user.password = await bcrypt.hash(password, saltRounds);
    await user.save();

    return res.status(200).json({ message: 'Password set successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to set password' });
  }
};

// 5. Login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await USERS.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.fullName,
      role: user.role?.toLowerCase?.() || user.role,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '1d' });

    // Ensure role is always lowercase in the response
    const userObj = user.toObject();
    userObj.role = userObj.role?.toLowerCase?.() || userObj.role;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  userRegistration,
  generateOTP,
  verifyOTP,
  createPassword,
  login,
};
