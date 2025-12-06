const jwt = require('jsonwebtoken');
const functions = require('firebase-functions');
const User = require('../models/User');

const auth = (db) => {
  const UserModel = new User(db);
  
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
      }

      const jwtSecret = process.env.JWT_SECRET || (functions.config().jwt && functions.config().jwt.secret) || 'fallback_secret';
      const decoded = jwt.verify(token, jwtSecret);
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
      req.db = db;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token is not valid' });
    }
  };
};

module.exports = auth;

