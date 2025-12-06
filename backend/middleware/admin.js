const auth = require('./auth');

// Admin middleware - requires authentication first, then checks admin status
const admin = async (req, res, next) => {
  // Use auth middleware first
  return auth(req, res, async () => {
    try {
      // If we get here, auth passed - check admin status
      // SQLite stores booleans as integers (0 or 1)
      if (!req.user) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }

      const isAdmin = req.user.isAdmin === 1 || req.user.isAdmin === true;
      if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // User is authenticated and is admin
      next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
  });
};

module.exports = admin;

