const auth = require('./auth');

const admin = (db) => {
  const authMiddleware = auth(db);
  
  return async (req, res, next) => {
    return authMiddleware(req, res, async () => {
      try {
        if (!req.user) {
          return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const isAdmin = req.user.isAdmin === true || req.user.isAdmin === 1;
        if (!isAdmin) {
          return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        next();
      } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
    });
  };
};

module.exports = admin;

