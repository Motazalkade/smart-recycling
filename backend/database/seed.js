const { db } = require('../config/database');

const seedData = () => {
  console.log('بدء إضافة البيانات الأولية...');

  // إضافة مواقع إعادة التدوير
  const locations = [
    {
      name: 'جهاز إعادة تدوير البلاستيك - الرياض',
      address: 'الرياض، حي الملز، near المركز التجاري',
      latitude: 24.7136,
      longitude: 46.6753,
      type: 'plastic'
    },
    {
      name: 'جهاز إعادة تدوير الورق - جدة',
      address: 'جدة، حي الصفا، شارع الأمير Sultan',
      latitude: 21.4858,
      longitude: 39.1925,
      type: 'paper'
    },
    {
      name: 'جهاز إعادة تدوير عام - الدمام',
      address: 'الدمام، حي الشاطئ، near الكورنيش',
      latitude: 26.4207,
      longitude: 50.0888,
      type: 'general'
    },
    {
      name: 'جهاز إعادة تدوير المعادن - الرياض',
      address: 'الرياض، حي العليا، near مجمع العليا',
      latitude: 24.7616,
      longitude: 46.6730,
      type: 'metal'
    },
    {
      name: 'جهاز إعادة تدوير الزجاج - جدة',
      address: 'جدة، حي السلامة، near سوق السلامة',
      latitude: 21.5433,
      longitude: 39.1730,
      type: 'glass'
    },
    {
      name: 'مركز إعادة التدوير الشامل - الرياض',
      address: 'الرياض، حي النخيل، near مستشفى الملك فيصل',
      latitude: 24.6900,
      longitude: 46.6850,
      type: 'general'
    }
  ];

  const stmt = db.prepare(`INSERT OR IGNORE INTO recycling_locations 
    (name, address, latitude, longitude, type) VALUES (?, ?, ?, ?, ?)`);

  locations.forEach(location => {
    stmt.run([location.name, location.address, location.latitude, location.longitude, location.type]);
  });

  stmt.finalize();

  // إضافة مستخدم مدير افتراضي
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(
    `INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
    ['admin', 'admin@recycling.com', hashedPassword, 'admin'],
    function(err) {
      if (err) {
        console.error('Error adding admin user:', err);
      } else {
        console.log('تم إضافة المستخدم المدير بنجاح');
      }
    }
  );

  console.log('تم إضافة البيانات الأولية بنجاح!');
};

// تشغيل وظيفة إضافة البيانات
seedData();