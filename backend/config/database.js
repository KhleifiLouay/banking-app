const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    accountNumber TEXT UNIQUE NOT NULL,
    balance REAL DEFAULT 10000.00,
    isAdmin INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Add isAdmin column to existing tables if it doesn't exist
  db.run(`ALTER TABLE users ADD COLUMN isAdmin INTEGER DEFAULT 0`, (err) => {
    // Ignore error if column already exists
  });

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    recipientAccount TEXT,
    balanceAfter REAL NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

  // Create index for better performance
  db.run('CREATE INDEX IF NOT EXISTS idx_user_id ON transactions(userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)');
  
  // Create default admin account if it doesn't exist
  const bcrypt = require('bcryptjs');
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'Admin1234'; // Must have uppercase, lowercase, and number
  
  db.get('SELECT * FROM users WHERE email = ?', [adminEmail], async (err, row) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }
    
    if (!row) {
      // Admin user doesn't exist, create it
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 12);
        const accountNumber = 'ACC' + Date.now() + 'ADMIN';
        
        db.run(
          `INSERT INTO users (firstName, lastName, email, password, accountNumber, balance, isAdmin) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Admin', 'User', adminEmail, hashedPassword, accountNumber, 10000.00, 1],
          function(insertErr) {
            if (insertErr) {
              console.error('Error creating admin user:', insertErr);
            } else {
              console.log('✓ Default admin account created:');
              console.log('  Email: admin@gmail.com');
              console.log('  Password: admin1234');
            }
          }
        );
      } catch (hashError) {
        console.error('Error hashing admin password:', hashError);
      }
    } else {
      // Admin exists, ensure it's set as admin
      if (row.isAdmin !== 1) {
        db.run('UPDATE users SET isAdmin = 1 WHERE email = ?', [adminEmail], (updateErr) => {
          if (updateErr) {
            console.error('Error updating admin status:', updateErr);
          } else {
            console.log('✓ Admin account already exists and is set as admin');
          }
        });
      } else {
        console.log('✓ Admin account already exists');
      }
    }
  });
});

console.log('SQLite database initialized');

module.exports = db;