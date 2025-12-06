const db = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=== Make User Admin ===\n');

// Get all users
db.all('SELECT id, firstName, lastName, email FROM users ORDER BY id', (err, users) => {
  if (err) {
    console.error('Error fetching users:', err);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log('No users found in database.');
    rl.close();
    process.exit(0);
  }

  console.log('Available users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ID: ${user.id}`);
  });

  rl.question('\nEnter the user ID to make admin (or "all" to make first user admin): ', (answer) => {
    let userId;
    
    if (answer.toLowerCase() === 'all') {
      // Make first user admin
      userId = users[0].id;
    } else {
      userId = parseInt(answer);
      if (isNaN(userId)) {
        console.log('Invalid input. Exiting.');
        rl.close();
        process.exit(1);
      }
    }

    // Update user to admin
    db.run('UPDATE users SET isAdmin = 1 WHERE id = ?', [userId], function(err) {
      if (err) {
        console.error('Error updating user:', err);
        rl.close();
        process.exit(1);
      }

      if (this.changes === 0) {
        console.log('User not found.');
      } else {
        const user = users.find(u => u.id === userId);
        console.log(`\n✓ Successfully made ${user.firstName} ${user.lastName} (${user.email}) an admin!`);
      }

      rl.close();
      process.exit(0);
    });
  });
});

