# Admin Interface Setup Guide

## Making a User an Admin

To make a user an administrator, you have two options:

### Option 1: Using the Script (Recommended)

1. Make sure your backend server is running and you have at least one user created
2. Run the following command from the `backend` directory:

```bash
npm run make-admin
```

3. Follow the prompts to select which user to make an admin
4. Or type "all" to automatically make the first user an admin

### Option 2: Direct Database Update

You can also manually update the database using SQLite:

```bash
sqlite3 backend/database.sqlite
UPDATE users SET isAdmin = 1 WHERE id = 1;
```

Replace `1` with the ID of the user you want to make an admin.

## Using the Admin Interface

1. Log in with an admin account
2. You'll see an "👑 Admin" button in the dashboard navigation
3. Click it to access the admin panel
4. From there you can:
   - View all users
   - Edit user information (name, email, balance)
   - Modify user balances
   - Delete users (except yourself)
   - View user transaction history
   - Make other users admins

## Features

- **User Management**: View, edit, and delete users
- **Balance Modification**: Adjust user account balances
- **Transaction Viewing**: See all transactions for any user
- **Admin Promotion**: Make other users administrators
- **Mobile Responsive**: Works on all devices

## Security Notes

- Only users with `isAdmin = 1` in the database can access admin routes
- Admins cannot delete their own accounts
- All admin actions are logged and protected by authentication middleware

