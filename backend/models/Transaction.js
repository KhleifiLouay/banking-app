const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    return new Promise((resolve, reject) => {
      const { userId, type, amount, description, recipientAccount, balanceAfter } = transactionData;
      
      const sql = `INSERT INTO transactions (userId, type, amount, description, recipientAccount, balanceAfter) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      
      db.run(sql, [userId, type, amount, description, recipientAccount, balanceAfter], function(err) {
        if (err) {
          reject(err);
        } else {
          // Get the newly created transaction
          db.get('SELECT * FROM transactions WHERE id = ?', [this.lastID], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    });
  }

  static async findByUserId(userId, limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT ?', 
        [userId, limit], 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async deleteByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM transactions WHERE userId = ?', [userId], function(err) {
        if (err) {
          console.error('Error in Transaction.deleteByUserId:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Transaction;