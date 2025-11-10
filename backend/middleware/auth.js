const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'لا يوجد token، صلاحية الدخول مرفوضة' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    db.get('SELECT id, username, email, role, points FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Token غير صالح' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Token غير صالح' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'صلاحية دخول مرفوضة. تحتاج صلاحية مدير' });
  }
  next();
};

module.exports = { auth, adminAuth };