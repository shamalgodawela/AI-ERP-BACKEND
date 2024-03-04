const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  // Validation
  if (!userName || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Check if user email already exists
  let existingUser = await Admin.findOne({ email: { $regex: new RegExp(email, 'i') } });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already in use' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await Admin.create({
    userName,
    email,
    password: hashedPassword,
  });

  // Generate token
  const token = generateToken(newUser._id);

  // Send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    secure: true,
  });

  // Respond with user data and token
  res.status(201).json({
    _id: newUser._id,
    userName: newUser.userName,
    email: newUser.email,
    token,
  });
});


  

module.exports = {
  registerUser,
  
};
