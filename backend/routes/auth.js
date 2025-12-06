const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validator = require('../middleware/validation');
const { authLimiter, signupLimiter } = require('../middleware/rateLimitAuth');
const router = express.Router();

// Signup
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password strength
    if (!validator.isValidPassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Sanitize inputs
    const sanitizedFirstName = validator.sanitizeString(firstName);
    const sanitizedLastName = validator.sanitizeString(lastName);
    const sanitizedEmail = email.toLowerCase().trim();

    if (sanitizedFirstName.length < 2 || sanitizedLastName.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    console.log('Signup attempt for:', sanitizedEmail);

    // Check if user exists
    const existingUser = await User.findByEmail(sanitizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with sanitized data
    const user = await User.create({ 
      firstName: sanitizedFirstName, 
      lastName: sanitizedLastName, 
      email: sanitizedEmail, 
      password 
    });
    console.log('User created successfully:', user.email);

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        isAdmin: user.isAdmin === 1 || user.isAdmin === true
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Validate email format
    if (!validator.isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    console.log('Login attempt for:', sanitizedEmail);

    // Check if user exists
    const user = await User.findByEmail(sanitizedEmail);
    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', sanitizedEmail);

    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        isAdmin: user.isAdmin === 1 || user.isAdmin === true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  const safeUser = {
    id: req.user.id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    accountNumber: req.user.accountNumber,
    balance: req.user.balance,
    isAdmin: req.user.isAdmin === 1 || req.user.isAdmin === true,
    createdAt: req.user.createdAt
  };
  res.json(safeUser);
});

module.exports = router;