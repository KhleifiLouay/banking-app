const express = require('express');
const admin = require('../middleware/admin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Get all users (admin only)
router.get('/users', admin, async (req, res) => {
  try {
    const users = await User.findAll();
    // Remove passwords from response
    const safeUsers = users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
      isAdmin: user.isAdmin === 1 || user.isAdmin === true,
      createdAt: user.createdAt
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single user by ID (admin only)
router.get('/users/:id', admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Remove password from response
    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountNumber: user.accountNumber,
      balance: user.balance,
      isAdmin: user.isAdmin === 1 || user.isAdmin === true,
      createdAt: user.createdAt
    };
    res.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/users/:id', admin, async (req, res) => {
  try {
    const { balance, firstName, lastName, email, isAdmin } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update balance if provided
    if (balance !== undefined) {
      await User.updateBalance(userId, parseFloat(balance));
    }

    // Update other fields if provided
    if (firstName || lastName || email || isAdmin !== undefined) {
      await User.update(userId, { firstName, lastName, email, isAdmin });
    }

    const updatedUser = await User.findById(userId);
    const safeUser = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      accountNumber: updatedUser.accountNumber,
      balance: updatedUser.balance,
      isAdmin: updatedUser.isAdmin === 1 || updatedUser.isAdmin === true,
      createdAt: updatedUser.createdAt
    };

    res.json({ message: 'User updated successfully', user: safeUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's transactions first (cascade)
    await Transaction.deleteByUserId(userId);
    
    // Delete user
    await User.delete(userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user transactions (admin only)
router.get('/users/:id/transactions', admin, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await Transaction.findByUserId(userId, 100); // Get more transactions for admin
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

