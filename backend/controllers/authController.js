const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  // التحقق من وجود المستخدم مسبقاً
  const existingUser = db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
  
  if (existingUser) {
    return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
  }

  // تشفير كلمة المرور
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'خطأ في تشفير كلمة المرور' });
    }

    // إضافة المستخدم الجديد
    const result = db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.lastID },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: { 
        id: result.lastID, 
        username, 
        email, 
        role: 'user', 
        points: 0 
      }
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
  }

  // التحقق من كلمة المرور
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err || !isMatch) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points
      }
    });
  });
};

const getProfile = (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getProfile };