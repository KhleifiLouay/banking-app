const admin = require('firebase-admin');

class Transaction {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('transactions');
  }

  async create(transactionData) {
    try {
      const { userId, type, amount, description, recipientAccount, balanceAfter } = transactionData;
      
      const transactionRef = this.collection.doc();
      const transaction = {
        id: transactionRef.id,
        userId,
        type,
        amount,
        description,
        recipientAccount: recipientAccount || null,
        balanceAfter,
        date: admin.firestore.FieldValue.serverTimestamp()
      };

      await transactionRef.set(transaction);
      return { ...transaction, date: new Date() };
    } catch (error) {
      console.error('Error in Transaction.create:', error);
      throw error;
    }
  }

  async findByUserId(userId, limit = 20) {
    try {
      const snapshot = await this.collection
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(limit)
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
    } catch (error) {
      console.error('Error in Transaction.findByUserId:', error);
      throw error;
    }
  }

  async deleteByUserId(userId) {
    try {
      const snapshot = await this.collection.where('userId', '==', userId).get();
      const batch = this.db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error in Transaction.deleteByUserId:', error);
      throw error;
    }
  }
}

module.exports = Transaction;

