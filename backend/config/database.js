const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// إنشاء المسار الكامل لقاعدة البيانات
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'recycling.db');

// تأكد من وجود مجلد database
if (!fs.existsSync(dbDir)) {
    console.log('إنشاء مجلد database...');
    fs.mkdirSync(dbDir, { recursive: true });
}

console.log('مسار قاعدة البيانات:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('خطأ في فتح قاعدة البيانات:', err.message);
    } else {
        console.log('تم الاتصال بقاعدة البيانات SQLite بنجاح');
    }
});

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // جدول المستخدمين
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                points INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('خطأ في إنشاء جدول المستخدمين:', err);
                    reject(err);
                } else {
                    console.log('تم إنشاء جدول المستخدمين');
                }
            });

            // جدول مواقع إعادة التدوير
            db.run(`CREATE TABLE IF NOT EXISTS recycling_locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                type TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('خطأ في إنشاء جدول المواقع:', err);
                    reject(err);
                } else {
                    console.log('تم إنشاء جدول مواقع التدوير');
                }
            });

            // جدول المواد المعاد تدويرها
            db.run(`CREATE TABLE IF NOT EXISTS recycling_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                item_type TEXT NOT NULL,
                image_path TEXT,
                is_recyclable INTEGER NOT NULL,
                nearest_location_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (nearest_location_id) REFERENCES recycling_locations (id)
            )`, (err) => {
                if (err) {
                    console.error('خطأ في إنشاء جدول المواد:', err);
                    reject(err);
                } else {
                    console.log('تم إنشاء جدول المواد');
                }
            });

            // إضافة بيانات أولية لمواقع إعادة التدوير
            const stmt = db.prepare(`INSERT OR IGNORE INTO recycling_locations 
                (name, address, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)`);
            
            const sampleLocations = [
                ['جهاز إعادة تدوير البلاستيك - الرياض', 'الرياض، حي الملز', 24.7136, 46.6753, 'plastic'],
                ['جهاز إعادة تدوير الورق - جدة', 'جدة، حي الصفا', 21.4858, 39.1925, 'paper'],
                ['جهاز إعادة تدوير عام - الدمام', 'الدمام، حي الشاطئ', 26.4207, 50.0888, 'general'],
                ['جهاز إعادة تدوير المعادن - الرياض', 'الرياض، حي العليا', 24.7616, 46.6730, 'metal'],
                ['جهاز إعادة تدوير الزجاج - جدة', 'جدة، حي السلامة', 21.5433, 39.1730, 'glass']
            ];

            sampleLocations.forEach((location, index) => {
                stmt.run(location, (err) => {
                    if (err) {
                        console.error(`خطأ في إضافة الموقع ${index + 1}:`, err);
                    }
                });
            });
            
            stmt.finalize((err) => {
                if (err) {
                    console.error('خطأ في إنهاء prepared statement:', err);
                    reject(err);
                } else {
                    console.log('تم إضافة البيانات الأولية للمواقع');
                    
                    // إضافة مستخدم مدير (بدون تشفير للمختبر)
                    db.run(
                        `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                        ['admin', 'admin@recycling.com', 'admin123', 'admin'],
                        (err) => {
                            if (err) {
                                console.error('خطأ في إضافة المستخدم المدير:', err);
                                reject(err);
                            } else {
                                console.log('✅ تم إضافة المستخدم المدير بنجاح!');
                                console.log('📧 البريد: admin@recycling.com');
                                console.log('🔑 كلمة المرور: admin123');
                                resolve();
                            }
                        }
                    );
                }
            });
        });
    });
};

module.exports = { db, initDatabase };