const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const admin = require('../middleware/admin');

module.exports = (db) => {
  const router = express.Router();
  const UserModel = new User(db);
  const TransactionModel = new Transaction(db);
  const adminMiddleware = admin(db);

  // Get all users
  router.get('/users', adminMiddleware, async (req, res) => {
    try {
      const users = await UserModel.findAll();
      const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.accountNumber,
        balance: user.balance,
        isAdmin: user.isAdmin === true || user.isAdmin === 1,
        createdAt: user.createdAt
      }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get user by ID
  router.get('/users/:id', adminMiddleware, async (req, res) => {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update user
  router.put('/users/:id', adminMiddleware, async (req, res) => {
    try {
      const { firstName, lastName, email, balance, isAdmin } = req.body;
      const updateData = {};
      
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (balance !== undefined) updateData.balance = parseFloat(balance);
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin === true || isAdmin === 1;

      await UserModel.update(req.params.id, updateData);
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete user
  router.delete('/users/:id', adminMiddleware, async (req, res) => {
    try {
      await TransactionModel.deleteByUserId(req.params.id);
      await UserModel.delete(req.params.id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get user transactions
  router.get('/users/:id/transactions', adminMiddleware, async (req, res) => {
    try {
      const transactions = await TransactionModel.findByUserId(req.params.id, 100);
      res.json(transactions);
    } catch (error) {
      console.error('Get user transactions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};

