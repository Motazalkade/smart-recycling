const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'recycling.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 فحص المستخدمين في قاعدة البيانات...');

db.all("SELECT id, username, email, password, role FROM users", (err, users) => {
    if (err) {
        console.error('❌ خطأ في جلب المستخدمين:', err);
        return;
    }
    
    console.log('👥 المستخدمين الموجودين:');
    if (users.length === 0) {
        console.log('❌ لا يوجد مستخدمين!');
    } else {
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.email})`);
            console.log(`     كلمة المرور: "${user.password}"`);
            console.log(`     الدور: ${user.role}`);
            console.log(`     الطول: ${user.password.length} حرف`);
            console.log('---');
        });
    }
    
    db.close();
});