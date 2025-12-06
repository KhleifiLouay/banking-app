const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        const { firstName, lastName, email, password } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);
        const accountNumber = 'ACC' + Date.now() + Math.floor(Math.random() * 1000);

        const sql = `INSERT INTO users (firstName, lastName, email, password, accountNumber, balance) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.run(sql, [firstName, lastName, email, hashedPassword, accountNumber, 10000.00], function(err) {
          if (err) {
            console.error('Database error in User.create:', err);
            reject(err);
          } else {
            // Get the newly created user
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
              if (err) {
                console.error('Error fetching created user:', err);
                reject(err);
              } else {
                console.log('User created in database:', row.email);
                resolve(row);
              }
            });
          }
        });
      } catch (error) {
        console.error('Error in User.create:', error);
        reject(error);
      }
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          console.error('Error in User.findByEmail:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error in User.findById:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findByAccountNumber(accountNumber) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE accountNumber = ?', [accountNumber], (err, row) => {
        if (err) {
          console.error('Error in User.findByAccountNumber:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async updateBalance(userId, newBalance) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], function(err) {
        if (err) {
          console.error('Error in User.updateBalance:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY createdAt DESC', (err, rows) => {
        if (err) {
          console.error('Error in User.findAll:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async update(userId, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (updateData.firstName !== undefined) {
        fields.push('firstName = ?');
        values.push(updateData.firstName);
      }
      if (updateData.lastName !== undefined) {
        fields.push('lastName = ?');
        values.push(updateData.lastName);
      }
      if (updateData.email !== undefined) {
        fields.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.isAdmin !== undefined) {
        fields.push('isAdmin = ?');
        values.push(updateData.isAdmin ? 1 : 0);
      }
      if (updateData.password !== undefined) {
        fields.push('password = ?');
        values.push(updateData.password);
      }
      
      if (fields.length === 0) {
        resolve();
        return;
      }
      
      values.push(userId);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      db.run(sql, values, function(err) {
        if (err) {
          console.error('Error in User.update:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  static async delete(userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) {
          console.error('Error in User.delete:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = User;