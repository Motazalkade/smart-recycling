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

const login = (req, res) => {
  console.log('🔐 طلب تسجيل دخول:', req.body);
  
  const { email, password } = req.body;

  if (!email || !password) {
    console.log('❌ بيانات ناقصة:', { email: !!email, password: !!password });
    return res.status(400).json({ 
      message: 'البريد الإلكتروني وكلمة المرور مطلوبان',
      received: { email: !!email, password: !!password }
    });
  }

  console.log('🔍 البحث عن المستخدم:', email);

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('❌ خطأ قاعدة بيانات:', err);
      return res.status(500).json({ message: 'خطأ في الخادم' });
    }

    if (!user) {
      console.log('❌ مستخدم غير موجود:', email);
      return res.status(400).json({ 
        message: 'بيانات الدخول غير صحيحة',
        hint: 'جرب admin@recycling.com / admin123'
      });
    }

    console.log('✅ وجد المستخدم:', user.email);

    // التحقق من كلمة المرور
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        console.log('❌ كلمة مرور خاطئة');
        return res.status(400).json({ 
          message: 'بيانات الدخول غير صحيحة',
          hint: 'كلمة المرور غير صحيحة'
        });
      }

      console.log('✅ كلمة المرور صحيحة');

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'smart_recycling_secret',
        { expiresIn: '7d' }
      );

      const userResponse = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        created_at: user.created_at
      };

      console.log('✅ تسجيل دخول ناجح:', userResponse.email);
      
      res.json({
        message: 'تم الدخول بنجاح',
        token,
        user: userResponse
      });
    });
  });
};
const getProfile = (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getProfile };