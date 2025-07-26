const express = require('express');
const { userRegistartion, generateOTP, verifyOTP, createPassword, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register_user', userRegistartion);
router.post('/generate_otp', generateOTP);
router.post('/verify_otp/:id', verifyOTP);
router.post('/create_password/:id', createPassword);
router.post('/login', login);


module.exports = router;
