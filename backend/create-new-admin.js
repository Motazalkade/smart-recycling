const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'recycling.db');
const db = new sqlite3.Database(dbPath);

console.log('👑 إنشاء مستخدم مدير جديد...');

// كلمة المرور الجديدة
const plainPassword = 'admin123';

// تشفير كلمة المرور
bcrypt.hash(plainPassword, 10, (err, hashedPassword) => {
    if (err) {
        console.error('❌ خطأ في تشفير كلمة المرور:', err);
        return;
    }

    // إضافة مستخدم مدير جديد
    db.run(
        `INSERT OR REPLACE INTO users (username, email, password, role, points) VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'admin@recycling.com', hashedPassword, 'admin', 100],
        function(err) {
            if (err) {
                console.error('❌ خطأ في إنشاء المدير:', err);
            } else {
                console.log('✅ تم إنشاء المستخدم المدير بنجاح!');
                console.log('📧 البريد: admin@recycling.com');
                console.log('🔑 كلمة المرور: admin123');
                console.log('👤 الدور: admin');
            }

            db.close();
        }
    );
});