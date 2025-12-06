const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const validator = require('../middleware/validation');

module.exports = (db) => {
  const router = express.Router();
  const UserModel = new User(db);
  const TransactionModel = new Transaction(db);
  const authMiddleware = auth(db);

  // Get balance
  router.get('/balance', authMiddleware, async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      res.json({ balance: user.balance });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get transactions
  router.get('/transactions', authMiddleware, async (req, res) => {
    try {
      const transactions = await TransactionModel.findByUserId(req.user.id, 50);
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Transfer money
  router.post('/transfer', authMiddleware, async (req, res) => {
    try {
      const { recipientAccount, amount, description } = req.body;
      
      if (!recipientAccount || !amount || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
      }

      if (!validator.isValidAmount(amount)) {
        return res.status(400).json({ message: 'Montant invalide (doit être entre 0.01 et 1,000,000 €)' });
      }

      if (!validator.isValidAccountNumber(recipientAccount)) {
        return res.status(400).json({ message: 'Numéro de compte invalide' });
      }

      const sanitizedDescription = validator.sanitizeString(description);
      if (sanitizedDescription.length < 3) {
        return res.status(400).json({ message: 'La description doit contenir au moins 3 caractères' });
      }

      const sender = await UserModel.findById(req.user.id);
      if (!sender) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (sender.balance < amount) {
        return res.status(400).json({ message: 'Solde insuffisant' });
      }

      const recipient = await UserModel.findByAccountNumber(recipientAccount);
      if (!recipient) {
        return res.status(404).json({ message: 'Compte bénéficiaire non trouvé' });
      }

      if (sender.id === recipient.id) {
        return res.status(400).json({ message: 'Vous ne pouvez pas transférer vers votre propre compte' });
      }

      const senderNewBalance = sender.balance - amount;
      const recipientNewBalance = recipient.balance + amount;

      await UserModel.updateBalance(sender.id, senderNewBalance);
      await UserModel.updateBalance(recipient.id, recipientNewBalance);

      await TransactionModel.create({
        userId: sender.id,
        type: 'transfer',
        amount: -amount,
        description: `Transfert vers ${recipientAccount}: ${sanitizedDescription}`,
        recipientAccount,
        balanceAfter: senderNewBalance
      });

      await TransactionModel.create({
        userId: recipient.id,
        type: 'transfer',
        amount: amount,
        description: `Transfert de ${sender.accountNumber}: ${sanitizedDescription}`,
        recipientAccount: sender.accountNumber,
        balanceAfter: recipientNewBalance
      });

      res.json({ 
        message: 'Transfert effectué avec succès',
        newBalance: senderNewBalance
      });
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({ message: 'Erreur lors du transfert', error: error.message });
    }
  });

  return router;
};

