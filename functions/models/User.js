const bcrypt = require('bcryptjs');

class User {
  constructor(db) {
    this.db = db;
    this.collection = db.collection('users');
  }

  async create(userData) {
    try {
      const { firstName, lastName, email, password } = userData;
      const hashedPassword = await bcrypt.hash(password, 12);
      const accountNumber = 'ACC' + Date.now() + Math.floor(Math.random() * 1000);

      const userRef = this.collection.doc();
      const user = {
        id: userRef.id,
        firstName,
        lastName,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        accountNumber,
        balance: 10000.00,
        isAdmin: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.set(user);
      return { ...user, createdAt: new Date() };
    } catch (error) {
      console.error('Error in User.create:', error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const snapshot = await this.collection.where('email', '==', email.toLowerCase().trim()).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error in User.findByEmail:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const doc = await this.collection.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error in User.findById:', error);
      throw error;
    }
  }

  async findByAccountNumber(accountNumber) {
    try {
      const snapshot = await this.collection.where('accountNumber', '==', accountNumber).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error in User.findByAccountNumber:', error);
      throw error;
    }
  }

  async updateBalance(userId, newBalance) {
    try {
      await this.collection.doc(userId).update({
        balance: newBalance
      });
    } catch (error) {
      console.error('Error in User.updateBalance:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      const snapshot = await this.collection.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error in User.findAll:', error);
      throw error;
    }
  }

  async update(userId, updateData) {
    try {
      const updateObj = {};
      
      if (updateData.firstName !== undefined) updateObj.firstName = updateData.firstName;
      if (updateData.lastName !== undefined) updateObj.lastName = updateData.lastName;
      if (updateData.email !== undefined) updateObj.email = updateData.email.toLowerCase().trim();
      if (updateData.balance !== undefined) updateObj.balance = updateData.balance;
      if (updateData.isAdmin !== undefined) updateObj.isAdmin = updateData.isAdmin;
      
      if (Object.keys(updateObj).length === 0) return;
      
      await this.collection.doc(userId).update(updateObj);
    } catch (error) {
      console.error('Error in User.update:', error);
      throw error;
    }
  }

  async delete(userId) {
    try {
      await this.collection.doc(userId).delete();
    } catch (error) {
      console.error('Error in User.delete:', error);
      throw error;
    }
  }
}

module.exports = User;

