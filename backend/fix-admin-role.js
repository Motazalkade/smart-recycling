const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'recycling.db');
const db = new sqlite3.Database(dbPath);

console.log('👑 تحديث دور المستخدم المدير...');

// تحديث دور المستخدم إلى admin
db.run(
    'UPDATE users SET role = ? WHERE email = ?',
    ['admin', 'mtza01185@gmail.com'],
    function(err) {
        if (err) {
            console.error('❌ خطأ في تحديث الدور:', err);
        } else {
            console.log('✅ تم تحديث الدور إلى admin');
            console.log('عدد الصفوف المتأثرة:', this.changes);
        }

        // التحقق
        db.get('SELECT * FROM users WHERE email = ?', ['mtza01185@gmail.com'], (err, user) => {
            if (err) {
                console.error('❌ خطأ في التحقق:', err);
            } else if (user) {
                console.log('✅ التحقق من المستخدم:');
                console.log('   - الاسم:', user.username);
                console.log('   - البريد:', user.email);
                console.log('   - الدور:', user.role);
            } else {
                console.log('❌ المستخدم غير موجود!');
            }
            
            db.close();
        });
    }
);