const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  // Check if user exists
  const user = await Admin.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User does not exist' });
  }



  // For debugging, assume password is correct without hashing
  // Replace this section with actual password hashing in production
  const isMatch = password === user.password;



  // If passwords do not match, return error
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate token
  const token = generateToken(user._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  // Respond with user data and token
  res.status(200).json({
    _id: user._id,
    userName: user.userName,
    email: user.email,
    token,
  });
});

module.exports = {
  loginUser,
};
