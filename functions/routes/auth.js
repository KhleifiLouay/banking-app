const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const validator = require('../middleware/validation');
const { authLimiter, signupLimiter } = require('../middleware/rateLimitAuth');

module.exports = (db) => {
  const router = express.Router();
  const UserModel = new User(db);
  const authMiddleware = auth(db);

  // Signup
  router.post('/signup', signupLimiter, async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Input validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (!validator.isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (!validator.isValidPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      const sanitizedFirstName = validator.sanitizeString(firstName);
      const sanitizedLastName = validator.sanitizeString(lastName);
      const sanitizedEmail = email.toLowerCase().trim();

      if (sanitizedFirstName.length < 2 || sanitizedLastName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters' });
      }

      // Check if user exists
      const existingUser = await UserModel.findByEmail(sanitizedEmail);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = await UserModel.create({ 
        firstName: sanitizedFirstName, 
        lastName: sanitizedLastName, 
        email: sanitizedEmail, 
        password 
      });

      // Create token
      const functions = require('firebase-functions');
      const jwtSecret = process.env.JWT_SECRET || (functions.config().jwt && functions.config().jwt.secret) || 'fallback_secret';
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
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
          isAdmin: user.isAdmin === true || user.isAdmin === 1
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

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      if (!validator.isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      const sanitizedEmail = email.toLowerCase().trim();

      const user = await UserModel.findByEmail(sanitizedEmail);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountNumber: user.accountNumber,
          balance: user.balance,
          isAdmin: user.isAdmin === true || user.isAdmin === 1
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get current user
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      res.json({
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        accountNumber: req.user.accountNumber,
        balance: req.user.balance,
        isAdmin: req.user.isAdmin === true || req.user.isAdmin === 1
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

