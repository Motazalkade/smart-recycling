const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'database', 'recycling.db');
const db = new Database(dbPath);

const initDatabase = () => {
  try {
    // جدول المستخدمين
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // جدول مواقع إعادة التدوير
    db.exec(`CREATE TABLE IF NOT EXISTS recycling_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // جدول المواد المعاد تدويرها
    db.exec(`CREATE TABLE IF NOT EXISTS recycling_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      item_type TEXT NOT NULL,
      image_path TEXT,
      is_recyclable INTEGER NOT NULL,
      nearest_location_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (nearest_location_id) REFERENCES recycling_locations (id)
    )`);

    // إضافة بيانات أولية للمواقع
    const locations = [
      ['جهاز إعادة تدوير البلاستيك - الرياض', 'الرياض، حي الملز', 24.7136, 46.6753, 'plastic'],
      ['جهاز إعادة تدوير الورق - جدة', 'جدة، حي الصفا', 21.4858, 39.1925, 'paper'],
      ['جهاز إعادة تدوير عام - الدمام', 'الدمام، حي الشاطئ', 26.4207, 50.0888, 'general'],
      ['جهاز إعادة تدوير المعادن - الرياض', 'الرياض، حي العليا', 24.7616, 46.6730, 'metal'],
      ['جهاز إعادة تدوير الزجاج - جدة', 'جدة، حي السلامة', 21.5433, 39.1730, 'glass']
    ];

    const stmt = db.prepare(`INSERT OR IGNORE INTO recycling_locations 
      (name, address, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)`);
    
    locations.forEach(location => {
      stmt.run(location);
    });

    // إضافة مستخدم مدير افتراضي
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`)
      .run('admin', 'admin@recycling.com', hashedPassword, 'admin');

    console.log('✅ تم تهيئة قاعدة البيانات بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
  }
};

// دوال مساعدة للاستعلامات
db.query = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return params.length ? stmt.all(...params) : stmt.all();
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

db.run = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return { lastID: result.lastInsertRowid, changes: result.changes };
  } catch (error) {
    console.error('Run error:', error);
    throw error;
  }
};

db.get = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return params.length ? stmt.get(...params) : stmt.get();
  } catch (error) {
    console.error('Get error:', error);
    throw error;
  }
};

module.exports = { db, initDatabase };