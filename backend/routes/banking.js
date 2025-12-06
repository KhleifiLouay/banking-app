const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const validator = require('../middleware/validation');
const router = express.Router();

// Get account balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.balance });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    console.log('Fetching transactions for user:', req.user.id);
    const transactions = await Transaction.findByUserId(req.user.id);
    console.log('Found transactions:', transactions);
    res.json(transactions);
  } catch (error) {
    console.error('Transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Transfer money
router.post('/transfer', auth, async (req, res) => {
  try {
    const { recipientAccount, amount, description } = req.body;
    
    // Input validation
    if (!recipientAccount || !amount || !description) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Validate amount
    if (!validator.isValidAmount(amount)) {
      return res.status(400).json({ message: 'Montant invalide (doit être entre 0.01 et 1,000,000 €)' });
    }

    // Validate account number format
    if (!validator.isValidAccountNumber(recipientAccount)) {
      return res.status(400).json({ message: 'Numéro de compte invalide' });
    }

    // Sanitize description
    const sanitizedDescription = validator.sanitizeString(description);
    if (sanitizedDescription.length < 3) {
      return res.status(400).json({ message: 'La description doit contenir au moins 3 caractères' });
    }
    
    console.log('Transfer request:', { recipientAccount, amount });

    const sender = await User.findById(req.user.id);
    const recipient = await User.findByAccountNumber(recipientAccount);

    if (!recipient) {
      return res.status(400).json({ message: 'Compte bénéficiaire non trouvé' });
    }

    if (sender.id === recipient.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas transférer à votre propre compte' });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Fonds insuffisants' });
    }

    // Update balances
    const senderNewBalance = parseFloat((sender.balance - amount).toFixed(2));
    const recipientNewBalance = parseFloat((recipient.balance + amount).toFixed(2));

    await User.updateBalance(sender.id, senderNewBalance);
    await User.updateBalance(recipient.id, recipientNewBalance);

    // Create transactions
    await Transaction.create({
      userId: sender.id,
      type: 'transfer',
      amount: -amount,
      description: `Transfert vers ${recipientAccount}: ${sanitizedDescription}`,
      recipientAccount,
      balanceAfter: senderNewBalance
    });

    await Transaction.create({
      userId: recipient.id,
      type: 'transfer',
      amount: amount,
      description: `Transfert de ${sender.accountNumber}: ${sanitizedDescription}`,
      recipientAccount: sender.accountNumber,
      balanceAfter: recipientNewBalance
    });

    // Update sender data in response
    const updatedSender = await User.findById(sender.id);

    res.json({ 
      message: 'Virement effectué avec succès!',
      newBalance: updatedSender.balance
    });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;