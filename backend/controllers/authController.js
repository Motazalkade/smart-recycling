const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 محاولة تسجيل مستخدم جديد:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    // التحقق من وجود المستخدم مسبقاً
    const existingUser = db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    
    if (existingUser) {
      return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إضافة المستخدم الجديد
    const result = db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    console.log('✅ نتيجة إضافة المستخدم:', result);

    if (!result || result.changes === 0) {
      return res.status(500).json({ message: 'خطأ في إنشاء المستخدم' });
    }

    const token = jwt.sign(
      { userId: result.lastID },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // الحصول على بيانات المستخدم الجديد بدون كلمة المرور
    const newUser = {
      id: result.lastID,
      username: username,
      email: email,
      role: 'user',
      points: 0
    };

    console.log('🎉 تم إنشاء المستخدم بنجاح:', newUser);

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('❌ خطأ في التسجيل:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء التسجيل' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 محاولة تسجيل دخول:', { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    const user = db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    // إرجاع بيانات المستخدم بدون كلمة المرور
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      points: user.points
    };

    console.log('✅ تم تسجيل الدخول بنجاح:', userWithoutPassword);

    res.json({
      message: 'تم الدخول بنجاح',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

const getProfile = (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getProfile };