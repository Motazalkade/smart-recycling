const { Pool } = require('pg');

// رابط قاعدة البيانات من Environment Variable أو الرابط الذي حصلت عليه
const connectionString = process.env.DATABASE_URL || 
  'postgresql://smart_recycling_db_user:ibRJFAX0sIoJQ5zTUN7P6n5r1VGTf17N@dpg-d5084pu3jp1c73f34gu0-a.oregon-postgres.render.com/smart_recycling_db';

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false  // ضروري لـ Render PostgreSQL
  }
});

const initDatabase = async () => {
  try {
    console.log('🔗 محاولة الاتصال بقاعدة PostgreSQL...');
    
    // اختبار الاتصال
    const client = await pool.connect();
    console.log('✅ تم الاتصال بقاعدة PostgreSQL بنجاح');
    client.release();

    // إنشاء الجداول إذا لم تكن موجودة
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recycling_locations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        type VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recycling_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL,
        image_path VARCHAR(255),
        is_recyclable BOOLEAN NOT NULL,
        nearest_location_id INTEGER REFERENCES recycling_locations(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ تم إنشاء/التأكد من الجداول');

    // إضافة بيانات أولية لمواقع التدوير
    const locations = [
      ['جهاز إعادة تدوير البلاستيك - الرياض', 'الرياض، حي الملز', 24.7136, 46.6753, 'plastic'],
      ['جهاز إعادة تدوير الورق - جدة', 'جدة، حي الصفا', 21.4858, 39.1925, 'paper'],
      ['جهاز إعادة تدوير عام - الدمام', 'الدمام، حي الشاطئ', 26.4207, 50.0888, 'general'],
      ['جهاز إعادة تدوير المعادن - الرياض', 'الرياض، حي العليا', 24.7616, 46.6730, 'metal'],
      ['جهاز إعادة تدوير الزجاج - جدة', 'جدة، حي السلامة', 21.5433, 39.1730, 'glass']
    ];

    for (const loc of locations) {
      await pool.query(
        `INSERT INTO recycling_locations (name, address, latitude, longitude, type) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (name) DO NOTHING`,
        loc
      );
    }

    console.log('✅ تم إضافة مواقع التدوير');

    // إضافة مستخدم مدير افتراضي
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO users (username, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin', 'admin@recycling.com', hashedPassword, 'admin']
    );

    console.log('✅ قاعدة البيانات مهيأة بالكامل مع PostgreSQL');

  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error.message);
    console.error('تفاصيل الخطأ:', error);
  }
};

module.exports = { pool, initDatabase };