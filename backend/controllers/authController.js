const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const register = (req, res) => {
    console.log('📝 طلب تسجيل:', req.body);
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], (err, user) => {
        if (err) {
            console.error('❌ خطأ في قاعدة البيانات:', err);
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }
        
        if (user) {
            console.log('❌ المستخدم موجود مسبقاً');
            return res.status(400).json({ message: 'المستخدم موجود مسبقاً' });
        }

        // تشفير كلمة المرور قبل الحفظ
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('❌ خطأ في تشفير كلمة المرور:', err);
                return res.status(500).json({ message: 'خطأ في الخادم' });
            }

            // إضافة المستخدم الجديد بكلمة مرور مشفرة
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 'user'],
                function(err) {
                    if (err) {
                        console.error('❌ خطأ في إنشاء المستخدم:', err);
                        return res.status(500).json({ message: 'خطأ في إنشاء المستخدم' });
                    }

                    console.log('✅ تم إنشاء مستخدم جديد بمعرف:', this.lastID);
                    
                    const token = jwt.sign(
                        { userId: this.lastID },
                        process.env.JWT_SECRET || 'secret',
                        { expiresIn: '7d' }
                    );

                    res.status(201).json({
                        message: 'تم إنشاء الحساب بنجاح',
                        token,
                        user: { 
                            id: this.lastID, 
                            username, 
                            email, 
                            role: 'user', 
                            points: 0 
                        }
                    });
                }
            );
        });
    });
};

const login = (req, res) => {
    console.log('🔐 طلب دخول:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('❌ خطأ في قاعدة البيانات:', err);
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }

        if (!user) {
            console.log('❌ مستخدم غير موجود:', email);
            return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        console.log('🔍 وجد المستخدم:', user.username);
        console.log('🔑 كلمة المرور في DB:', user.password);

        // استخدام bcrypt لمقارنة كلمة المرور
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('❌ خطأ في مقارنة كلمة المرور:', err);
                return res.status(500).json({ message: 'خطأ في الخادم' });
            }

            if (isMatch) {
                console.log('✅ كلمة المرور صحيحة!');
                
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
            } else {
                console.log('❌ كلمة المرور خاطئة!');
                return res.status(400).json({ message: 'بيانات الدخول غير صحيحة' });
            }
        });
    });
};

const getProfile = (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, getProfile };